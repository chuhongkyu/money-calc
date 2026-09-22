import { SnackbarProvider } from "seed-design/ui/snackbar";
import { Stack } from "./stackflow";

export function App() {
  return (
    <SnackbarProvider>
      <Stack />
    </SnackbarProvider>
  );
}
