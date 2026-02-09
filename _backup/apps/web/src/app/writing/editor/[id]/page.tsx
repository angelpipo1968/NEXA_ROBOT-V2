import { Editor } from '@/components/writing/Editor';

interface PageProps {
    params: {
        id: string;
    }
}

export default function EditorPage({ params }: PageProps) {
    // In a real app, we would fetch book data based on params.id
    // const book = await getBook(params.id);

    return (
        <div className="h-screen w-full">
            <Editor bookId={params.id} initialContent="Chapter 1: The Beginning&#10;&#10;It was a dark and stormy night..." />
        </div>
    );
}
