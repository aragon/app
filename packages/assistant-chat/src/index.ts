// Lean public barrel (kept small so the host app can load the widget behind next/dynamic): the
// root component, its props and the monitoring seam. Internal modules are deliberately not
// re-exported.
export {
    AssistantChat,
    type IAssistantChatProps,
} from './components/assistantChat';
export {
    type IChatMonitoring,
    type IChatMonitoringErrorParams,
    type IChatMonitoringMessageParams,
    noopMonitoring,
} from './monitoring';
