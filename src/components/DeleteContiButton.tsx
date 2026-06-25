'use client'

export function DeleteContiButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('이 콘티를 삭제할까요?')) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
      >
        이 콘티 삭제
      </button>
    </form>
  )
}
