import { addDays, differenceInHours, endOfDay, isAfter, isBefore, startOfDay, startOfToday, endOfYesterday, format } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Task {
  id: string
  title: string
  description: string
  due_date: string
  completed: boolean
  user_id: string
}

interface RescheduleResult {
  success: boolean
  message: string
  updatedTasks?: { id: string; due_date: string }[]
  error?: any
}

export async function rescheduleOverdueTasks(): Promise<RescheduleResult> {
  const supabase = createClientComponentClient()
  
  try {
    // Get all overdue tasks
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log("No authenticated user found")
      return {
        success: false,
        message: "No authenticated user found",
      }
    }

    const today = startOfToday()
    console.log("Fetching overdue tasks before:", format(today, "yyyy-MM-dd HH:mm:ss"))

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false)
      .lt("due_date", format(today, "yyyy-MM-dd"))
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching overdue tasks:", error)
      return {
        success: false,
        message: "Failed to fetch overdue tasks",
        error
      }
    }

    console.log("Found overdue tasks:", tasks)

    if (!tasks?.length) {
      console.log("No overdue tasks found")
      return {
        success: true,
        message: "No tasks needed rescheduling",
        updatedTasks: []
      }
    }

    const now = new Date()
    const hoursLeftToday = differenceInHours(endOfDay(now), now)
    console.log("Hours left today:", hoursLeftToday)

    // Get tasks for next 7 days to check workload
    const { data: nextWeekTasks, error: nextWeekError } = await supabase
      .from("tasks")
      .select("due_date")
      .eq("user_id", user.id)
      .eq("completed", false)
      .gte("due_date", format(today, "yyyy-MM-dd"))
      .lte("due_date", format(addDays(today, 7), "yyyy-MM-dd"))

    if (nextWeekError) {
      console.error("Error fetching next week's tasks:", nextWeekError)
      return {
        success: false,
        message: "Failed to fetch next week's tasks",
        error: nextWeekError
      }
    }

    console.log("Next week's tasks:", nextWeekTasks)

    // Count tasks per day for the next 7 days
    const tasksPerDay: { [key: string]: number } = {}
    nextWeekTasks?.forEach(task => {
      const date = task.due_date.split("T")[0]
      tasksPerDay[date] = (tasksPerDay[date] || 0) + 1
    })

    console.log("Current tasks per day:", tasksPerDay)

    // Process overdue tasks
    const updates = tasks.map((task, index) => {
      let newDueDate: Date

      if (index === 0 && hoursLeftToday >= 2) {
        // Assign first task to today if we have more than 2 hours left
        newDueDate = new Date(now)
        newDueDate.setHours(10, 0, 0, 0)
        if (newDueDate.getHours() < 10) {
          newDueDate.setHours(10, 0, 0, 0)
        }
      } else {
        // Find the next day with less than 3 tasks
        let daysToAdd = 1
        while (true) {
          const targetDate = addDays(today, daysToAdd)
          const dateStr = format(targetDate, "yyyy-MM-dd")
          if (!tasksPerDay[dateStr] || tasksPerDay[dateStr] < 3) {
            newDueDate = targetDate
            newDueDate.setHours(10, 0, 0, 0)
            // Update our tracking of tasks per day
            tasksPerDay[dateStr] = (tasksPerDay[dateStr] || 0) + 1
            break
          }
          daysToAdd++
        }
      }

      // Keep all existing task data and only update the due_date
      const update = {
        ...task, // Preserve all existing fields
        due_date: format(newDueDate, "yyyy-MM-dd'T'HH:mm:ssXXX")
      }
      console.log(`Rescheduling task ${task.id} from ${task.due_date} to ${update.due_date}`)
      return update
    })

    console.log("Updates to be made:", updates)

    // Batch update all tasks
    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from("tasks")
        .upsert(updates, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })

      if (updateError) {
        console.error("Error updating tasks:", updateError)
        return {
          success: false,
          message: "Failed to update tasks",
          error: updateError
        }
      }

      console.log("Successfully updated tasks")
      return {
        success: true,
        message: `Rescheduled ${updates.length} overdue tasks`,
        updatedTasks: updates
      }
    }

    return {
      success: true,
      message: "No tasks needed rescheduling",
      updatedTasks: []
    }

  } catch (error) {
    console.error("Error in rescheduleOverdueTasks:", error)
    return {
      success: false,
      message: "Failed to reschedule overdue tasks",
      error
    }
  }
}
