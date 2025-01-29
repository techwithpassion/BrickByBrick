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
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { NewSubjectDialog } from "./new-subject-dialog"
import { EditSubjectDialog } from "./edit-subject-dialog"
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

export function SubjectList() {
  const {
    subjects,
    selectedSubject,
    selectSubject,
    deleteSubject,
    isLoading,
  } = useSubjects()
  const [showNewDialog, setShowNewDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [subjectToEdit, setSubjectToEdit] = React.useState<{
    id: string
    name: string
    description?: string | null
  } | null>(null)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>Loading your subjects...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Manage your study subjects</CardDescription>
          </div>
          <Button
            size="sm"
            className="mt-0"
            onClick={() => setShowNewDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                No subjects added yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={cn(
                    "flex items-center justify-between rounded-md border p-4",
                    selectedSubject?.id === subject.id &&
                      "border-primary bg-primary/5"
                  )}
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => selectSubject(subject)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {subject.name}
                      </p>
                      {subject.description && (
                        <p className="text-sm text-muted-foreground">
                          {subject.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {subject.completedTopics} of {subject.topics.length} topics
                        completed
                      </p>
                    </div>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSubjectToEdit(subject)
                          setShowEditDialog(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSubjectToEdit(subject)
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

      <NewSubjectDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
      />

      {subjectToEdit && (
        <>
          <EditSubjectDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            subject={subjectToEdit}
          />

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{subjectToEdit.name}
                  &quot;? This will also delete all topics associated with this
                  subject. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteSubject(subjectToEdit.id)}
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
