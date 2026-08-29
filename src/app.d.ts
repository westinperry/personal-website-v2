declare global {
  namespace App {
    interface Locals { admin: { id: number; email: string } | null }
    interface Error { message: string }
  }
}
export {};
