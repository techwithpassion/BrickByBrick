import { Metadata } from "next"
import { SubjectsProvider } from "@/contexts/subjects-context"
import { SubjectList } from "@/components/features/subjects/subject-list"
import { TopicList } from "@/components/features/subjects/topic-list"
import { SubjectProgress } from "@/components/features/subjects/subject-progress"

export const metadata: Metadata = {
  title: "Subjects - Brick By Brick",
  description: "Manage your subjects and topics",
}

export default function SubjectsPage() {
  return (
    <SubjectsProvider>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Subjects</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,2fr]">
          <div>
            <SubjectList />
          </div>
          <div className="space-y-8">
            <SubjectProgress />
            <TopicList />
          </div>
        </div>
      </div>
    </SubjectsProvider>
  )
}
