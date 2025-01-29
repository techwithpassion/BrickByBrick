"use client"

import * as React from "react"
import { useSubjects } from "@/contexts/subjects-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { NewTopicDialog } from "./new-topic-dialog"
import { EditTopicDialog } from "./edit-topic-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function TopicList() {
  const { selectedSubject, updateTopic, deleteTopic } = useSubjects()
  const [showNewDialog, setShowNewDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [topicToEdit, setTopicToEdit] = React.useState<{
    id: string
    name: string
    description?: string | null
    completed: boolean
  } | null>(null)

  if (!selectedSubject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>
            Select a subject to view its topics
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Topics</CardTitle>
            <CardDescription>
              Topics for {selectedSubject.name}
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="mt-0"
            onClick={() => setShowNewDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Topic
          </Button>
        </CardHeader>
        <CardContent>
          {selectedSubject.topics.length === 0 ? (
            <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                No topics added yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedSubject.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between space-x-4 rounded-md border p-4"
                >
                  <div className="flex flex-1 items-start space-x-4">
                    <Checkbox
                      checked={topic.completed}
                      onCheckedChange={(checked) =>
                        updateTopic(topic.id, {
                          ...topic,
                          completed: checked as boolean,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-medium leading-none ${
                          topic.completed && "line-through opacity-70"
                        }`}
                      >
                        {topic.name}
                      </p>
                      {topic.description && (
                        <p
                          className={`text-sm text-muted-foreground ${
                            topic.completed && "line-through opacity-70"
                          }`}
                        >
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setTopicToEdit(topic)
                          setShowEditDialog(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setTopicToEdit(topic)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewTopicDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        subjectId={selectedSubject.id}
      />

      {topicToEdit && (
        <>
          <EditTopicDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            topic={topicToEdit}
          />

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{topicToEdit.name}
                  &quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteTopic(topicToEdit.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  )
}
