'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store/hooks';
import RightSidebar from '../../../components/RightSidebar';
import apiService from '../../../utils/apiService';
import IISMethods from '../../../utils/IISMethods';

const GeneralSettingView = ({ formKey, handleAddButtonClick, handleFormData, onReloadEmbed }) => {
  const loading = useAppSelector((s) => s.loading);
  const showShimmer = loading?.showgridlistshimmer;
  const [frequencyDays, setFrequencyDays] = useState('1');
  const [loadingFrequency, setLoadingFrequency] = useState(false);
  const [savingFrequency, setSavingFrequency] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingFrequency(true);
      try {
        const response = await apiService.get('/settings');
        const value = Number(response?.data?.data?.spin_popup_frequency_days);
        if (!active) return;
        setFrequencyDays(String(Number.isFinite(value) && value > 0 ? Math.floor(value) : 1));
      } catch (error) {
        if (!active) return;
        IISMethods.errormsg(error?.message || 'Unable to load spin popup frequency');
      } finally {
        if (active) setLoadingFrequency(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveFrequency = async () => {
    const parsed = Number(frequencyDays);
    const safeValue = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
    setSavingFrequency(true);
    try {
      const response = await apiService.put('/settings', { spin_popup_frequency_days: safeValue });
      if (response?.success) {
        setFrequencyDays(String(safeValue));
        IISMethods.successmsg('Spin popup frequency updated');
      } else {
        IISMethods.errormsg(response?.message || 'Unable to update spin popup frequency');
      }
    } catch (error) {
      IISMethods.errormsg(error?.message || 'Unable to update spin popup frequency');
    } finally {
      setSavingFrequency(false);
    }
  };

  return (
    <div className="general-setting-page container-fluid flex-grow-1 min-h-0 d-flex flex-column w-100 p-0">
      <div className="px-3 py-2 border-bottom bg-light">
        <div className="d-flex flex-column flex-md-row align-items-md-end gap-2">
          <div className="flex-grow-1">
            <label className="form-label fw-semibold mb-1">Spin Popup Frequency (in days)</label>
            <input
              type="number"
              min={1}
              className="form-control"
              value={frequencyDays}
              disabled={loadingFrequency || savingFrequency}
              onChange={(e) => setFrequencyDays(e.target.value)}
            />
            <small className="text-muted">1 = show daily, 3 = show every 3 days</small>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loadingFrequency || savingFrequency}
            onClick={handleSaveFrequency}
          >
            {savingFrequency ? 'Saving...' : 'Save Frequency'}
          </button>
        </div>
      </div>
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
