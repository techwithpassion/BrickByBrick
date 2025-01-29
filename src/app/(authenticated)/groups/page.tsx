import { Metadata } from "next"
import { StudyGroupProvider } from "@/contexts/study-group-context"
import { GroupList } from "@/components/features/groups/group-list"
import { GroupChat } from "@/components/features/groups/group-chat"
import { NewGroupDialog } from "@/components/features/groups/new-group-dialog"

export const metadata: Metadata = {
  title: "Study Groups - Brick By Brick",
  description: "Collaborate with other students in study groups",
}

export default function GroupsPage() {
  return (
    <StudyGroupProvider>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <NewGroupDialog />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,2fr]">
          <GroupList />
          <GroupChat />
        </div>
      </div>
    </StudyGroupProvider>
  )
}
