import { addToast } from "./toast";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: (options: ToastOptions) => addToast(options),
  };
}
