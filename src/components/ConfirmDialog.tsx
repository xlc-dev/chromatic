import { Show, createSignal } from "solid-js";
import { setSkipConfirmation, type ConfirmationAction } from "../utils/confirmation";
import ToggleSwitch from "./ToggleSwitch";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  storageKey?: ConfirmationAction;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const [dontAskAgain, setDontAskAgain] = createSignal(false);

  const handleConfirm = () => {
    if (props.storageKey && dontAskAgain()) {
      setSkipConfirmation(props.storageKey, true);
    }
    props.onConfirm();
    setDontAskAgain(false);
  };

  const handleCancel = () => {
    setDontAskAgain(false);
    props.onCancel();
  };

  return (
    <Show when={props.open}>
      <div class="dialog-overlay" onClick={handleCancel}>
        <div class="dialog" onClick={(e) => e.stopPropagation()}>
          <h3 class="dialog-title">{props.title}</h3>
          <p class="dialog-message">{props.message}</p>
          {props.storageKey && (
            <div class="dialog-checkbox">
              <ToggleSwitch
                checked={dontAskAgain()}
                onChange={setDontAskAgain}
                label="Don't ask again"
              />
            </div>
          )}
          <div class="dialog-actions">
            <button onClick={handleCancel} class="dialog-btn dialog-btn-cancel">
              {props.cancelText || "Cancel"}
            </button>
            <button onClick={handleConfirm} class="dialog-btn dialog-btn-confirm">
              {props.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
