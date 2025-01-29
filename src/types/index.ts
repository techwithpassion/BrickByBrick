import { User, Timer, Task, StudyGroup } from "@prisma/client"

export type SafeUser = Omit<User, "password">

export interface TimerWithUser extends Timer {
  user: SafeUser
  user_id: string
  name: string
  duration: number
  created_at: string
  updated_at: string
}

export interface TaskWithDetails extends Task {
  user: SafeUser
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  created_at: string
  updated_at: string
  subject: {
    name: string
  }
  topic?: {
    name: string
  } | null
}

export interface StudyGroupWithMembers extends StudyGroup {
  members: {
    user: SafeUser
    role: string
  }[]
}
