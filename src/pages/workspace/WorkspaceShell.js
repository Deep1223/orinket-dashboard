import './workspace.css';

/** Light single-column shell; navigation is via profile drawer only. */
export default function WorkspaceShell({ children }) {
    return (
        <div className="ws-page">
            <div className="ws-inner">
                <div className="ws-main">{children}</div>
            </div>
        </div>
    );
}
