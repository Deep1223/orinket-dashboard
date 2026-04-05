'use client';

import { useAppSelector } from '../../../store/hooks';
import RightSidebar from '../../../components/RightSidebar';

const GeneralSettingView = ({ formKey, handleAddButtonClick, handleFormData, onReloadEmbed }) => {
  const loading = useAppSelector((s) => s.loading);
  const showShimmer = loading?.showgridlistshimmer;

  return (
    <div className="general-setting-page container-fluid flex-grow-1 min-h-0 d-flex flex-column w-100 p-0">
      <div className="flex-grow-1 min-h-0 d-flex flex-column general-setting-page-inner w-100">
        {showShimmer ? (
          <div className="d-flex align-items-center justify-content-center py-5 text-muted flex-grow-1">
            Loading settings…
          </div>
        ) : (
          <div className="right-sidebar-settings-host d-flex flex-column flex-grow-1 min-h-0 w-100">
            <RightSidebar
              key={formKey}
              embedMode
              handleAddButtonClick={handleAddButtonClick}
              handleFormData={handleFormData}
              onCancelEmbed={onReloadEmbed}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSettingView;
