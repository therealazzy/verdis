"use client"

import { useActionState, useState } from "react"
import { updateUsernameAction } from "@/app/actions/profile"

type UsernameFormProps = {
  initialUsername: string
}

type FormState = {
  error?: string
  success?: string
}

const initialState: FormState = {}

async function submitUsername(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await updateUsernameAction(formData)
  if (result.data === null) {
    return { error: result.error }
  }
  return { success: "Username updated." }
}

export function UsernameForm({ initialUsername }: UsernameFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [usernameInput, setUsernameInput] = useState(initialUsername)
  const [state, formAction, pending] = useActionState(
    submitUsername,
    initialState,
  )

  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
        Username
      </span>
      {!isEditing ? (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="text-lg font-medium">{initialUsername || "User"}</div>
          <button
            type="button"
            onClick={() => {
              setUsernameInput(initialUsername)
              setIsEditing(true)
            }}
            className="rounded-md border border-[color:var(--color-border-soft)] px-3 py-1.5 text-sm text-[color:var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Change username
          </button>
        </div>
      ) : (
        <form
          action={formAction}
          className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            name="username"
            value={usernameInput}
            onChange={(event) => setUsernameInput(event.target.value)}
            className="w-full rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-3 py-1.5 text-sm text-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)] sm:w-auto"
            placeholder="Enter username"
          />
          <button
            type="submit"
            disabled={pending}
            className="btn-primary px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false)
              setUsernameInput(initialUsername)
            }}
            disabled={pending}
            className="rounded-md border border-[color:var(--color-border-soft)] px-3 py-1.5 text-sm text-[color:var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
          >
            Cancel
          </button>
        </form>
      )}
      <div className="mt-1 min-h-4 text-xs text-[color:var(--color-text-muted)]">
        {state.error ?? state.success ?? ""}
      </div>
    </div>
  )
}
