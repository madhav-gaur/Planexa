import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../pages/styles/Accounts.css'
import './styles/Settings.css'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { toast } from 'react-toastify'
import { mergeWorkspace } from '../store/workspace.slice'
import ButtonLoading from '../components/ButtonLoading'
import Loading from '../components/Loading'

const defaultSettings = {
  allowGuestAccess: true,
  taskAutoAssign: true,
  maxProjects: 20,
  maxMembers: 100,
  allowFileUploads: true,
  allowSubtasks: true,
  allowComments: true,
}

const Settings = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userDetails)
  const { currWorkspace } = useSelector((state) => state.workspace)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [settings, setSettings] = useState(defaultSettings)

  const [savingDetails, setSavingDetails] = useState(false)
  const [savingLogo, setSavingLogo] = useState(false)
  const [savingRules, setSavingRules] = useState(false)
  const [deletingWorkspace, setDeletingWorkspace] = useState(false)

  const currentUserRole = user?.workspaces?.find(
    (w) => w.workspaceId?.toString() === currWorkspace?._id?.toString(),
  )?.role
  const isAdmin = currentUserRole === 'ADMIN'

  useEffect(() => {
    if (!currWorkspace?._id) return
    setName(currWorkspace.name || '')
    setDescription(currWorkspace.description || '')
    setLogoPreview(currWorkspace.logo || null)
    setLogoFile(null)
    setSettings({
      ...defaultSettings,
      ...(currWorkspace.settings || {}),
    })
  }, [currWorkspace])

  const handleLogoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSaveDetails = async (e) => {
    e.preventDefault()
    if (!isAdmin || !currWorkspace?._id) return
    setSavingDetails(true)
    try {
      const response = await Axios({
        ...apiList.updateWorkspace,
        url: `${apiList.updateWorkspace.url}/${currWorkspace._id}`,
        data: { name: name.trim(), description },
      })
      if (response.data.success) {
        dispatch(mergeWorkspace(response.data.data))
        toast.success('Workspace details updated')
      }
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || 'Could not update workspace'
      toast.error(msg)
    } finally {
      setSavingDetails(false)
    }
  }

  const handleUploadLogo = async () => {
    if (!isAdmin || !currWorkspace?._id || !logoFile) return
    setSavingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)
      const response = await Axios({
        ...apiList.updateWorkspaceLogo,
        url: `${apiList.updateWorkspaceLogo.url}/${currWorkspace._id}/logo`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (response.data.success) {
        dispatch(mergeWorkspace(response.data.data))
        setLogoFile(null)
        if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
        setLogoPreview(response.data.data.logo || null)
        toast.success('Workspace logo updated')
      }
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || 'Could not upload logo'
      toast.error(msg)
    } finally {
      setSavingLogo(false)
    }
  }

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveRules = async (e) => {
    e.preventDefault()
    if (!isAdmin || !currWorkspace?._id) return
    setSavingRules(true)
    try {
      const response = await Axios({
        ...apiList.updateWorkspaceSettings,
        url: `${apiList.updateWorkspaceSettings.url}/${currWorkspace._id}/settings`,
        data: settings,
      })
      if (response.data.success) {
        dispatch(mergeWorkspace(response.data.data))
        toast.success('Workspace rules updated')
      }
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || 'Could not update settings'
      toast.error(msg)
    } finally {
      setSavingRules(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!isAdmin || !currWorkspace?._id) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${currWorkspace.name}"? This action cannot be undone and will permanently delete all projects, tasks, and remove all members from this workspace.`
    )

    if (!confirmDelete) return

    setDeletingWorkspace(true)
    try {
      const response = await Axios({
        ...apiList.deleteWorkspace,
        url: `${apiList.deleteWorkspace.url}/${currWorkspace._id}`,
      })

      if (response.data.success) {
        toast.success('Workspace deleted successfully')
        // Navigate to home or another workspace
        window.location.href = '/'
      }
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || 'Could not delete workspace'
      toast.error(msg)
    } finally {
      setDeletingWorkspace(false)
    }
  }

  if (!currWorkspace?._id) {
    return <Loading />
  }

  const workLetter = currWorkspace.name?.charAt(0)?.toUpperCase() || 'W'

  return (
    <>
      <div className="dashboard-head">
        <div className="dashboard-head-left">
          <h2>Workspace settings</h2>
          <p>Manage {currWorkspace.name} - profile and rules for this workspace</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="settings-admin-note" style={{
          marginBottom: '1rem',
          padding: '0.85rem 1rem',
          border: 'var(--border)',
          borderRadius: '7px',
          fontSize: '14px',
          color: 'var(--text-light)',
        }}>
          Only workspace <strong style={{ color: 'var(--text-normal)' }}>admins</strong> can edit these settings. You can view them with your current role ({currentUserRole || '-'}).
        </div>
      )}

      <div className="account-wrapper" style={{flexDirection:'column'}}>
        <div className="account-content">
          <div className="settings-grid">
            <div className="account-section settings-card">
              <div className="account-section-head">
                <h3>General</h3>
                <p>Workspace name, description, and logo</p>
              </div>

              <div className="general-section-grid">
                <div className="account-avatar-container workspace-logo-block">
                  <div className="workspace-settings-logo">
                    {logoPreview ? (
                      <img src={logoPreview} alt="" />
                    ) : (
                      <span>{workLetter}</span>
                    )}
                  </div>
                  <div className="account-avatar-actions">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      id="ws-logo"
                      style={{ display: 'none' }}
                      disabled={!isAdmin}
                      placeholder=' '
                      onChange={handleLogoPick}
                    />
                    <label htmlFor="ws-logo" className={`primary-button ghost-button ${!isAdmin ? 'disabled' : ''}`}>
                      Choose image
                    </label>
                    <button
                      type="button"
                      className="primary-button"
                      // disabled={}
                      onClick={handleUploadLogo}
                    >
                      {savingLogo ? (
                        <>
                          <ButtonLoading /> Uploading
                        </>
                      ) : (
                        'Upload logo'
                      )}
                    </button>
                  </div>
                </div>

                <form className="app-form account-form settings-general-form" onSubmit={handleSaveDetails}>
                  <div className="app-form-item">
                    <div style={{ maxWidth: 'none', width: '100%' }}>
                      <input
                        id="ws-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isAdmin}
                        required
                        placeholder=' '
                        style={{
                          padding: '10px 12px',
                          border: 'var(--border)',
                          borderRadius: '7px',
                          width: '100%',
                          maxWidth: 'none',
                        }}
                      />
                      <label htmlFor="ws-name">Workspace name</label>

                    </div>
                  </div>
                  <div className="app-form-item">
                    <div style={{ width: '100%' }}>
                      <textarea
                        id="ws-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!isAdmin}
                        rows={4}
                        placeholder='Description'
                        style={{
                          padding: '10px 12px',
                          border: 'var(--border)',
                          borderRadius: '7px',
                          width: '100%',
                          minHeight: '8rem',
                          maxWidth: 'none',
                          resize: 'vertical',
                        }}
                      />
                      {/* <label htmlFor="ws-desc">Description</label> */}

                    </div>
                  </div>
                  <button type="submit" className="primary-button" disabled={!isAdmin || savingDetails} style={{ width: 'fit-content', marginTop: '0.5rem' }}>
                    {savingDetails ? (
                      <>
                        <ButtonLoading /> Saving
                      </>
                    ) : (
                      'Save details'
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="account-section settings-card">
              <div className="account-section-head">
                <h3>Rules & limits</h3>
                <p>Defaults for collaboration and capacity in this workspace</p>
              </div>

              <form className="settings-rules-form" onSubmit={handleSaveRules}>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowGuestAccess}
                    disabled={!isAdmin}
                    onChange={(e) => handleSettingsChange('allowGuestAccess', e.target.checked)}
                  />
                  <span>Allow guest access</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.taskAutoAssign}
                    disabled={!isAdmin}
                    onChange={(e) => handleSettingsChange('taskAutoAssign', e.target.checked)}
                  />
                  <span>Task auto-assign</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowFileUploads}
                    disabled={!isAdmin}
                    onChange={(e) => handleSettingsChange('allowFileUploads', e.target.checked)}
                  />
                  <span>Allow file uploads</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowSubtasks}
                    disabled={!isAdmin}
                    onChange={(e) => handleSettingsChange('allowSubtasks', e.target.checked)}
                  />
                  <span>Allow subtasks</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowComments}
                    disabled={!isAdmin}
                    onChange={(e) => handleSettingsChange('allowComments', e.target.checked)}
                  />
                  <span>Allow comments</span>
                </label>

                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: '1rem' }}>

                  <div className="app-form-item settings-number-row">
                    <div style={{ width: '100%' }}>
                      <input
                        style={{ maxWidth: 'none' }}
                        id="max-p"
                        type="number"
                        min={currWorkspace.projects.length}
                        max={10000}
                        value={settings.maxProjects}
                        disabled={!isAdmin}
                        onChange={(e) =>
                          handleSettingsChange('maxProjects', Number(e.target.value))
                        }
                      />
                      <label htmlFor="max-p">Max projects</label>
                    </div>
                  </div>
                  <div className="app-form-item settings-number-row">
                    <div style={{ width: '100%' }}>
                      <input
                        style={{ maxWidth: 'none' }}
                        id="max-m"
                        type="number"
                        min={currWorkspace.members.length}
                        max={10000}
                        value={settings.maxMembers}
                        disabled={!isAdmin}
                        onChange={(e) =>
                          handleSettingsChange('maxMembers', Number(e.target.value))
                        }
                      />
                      <label htmlFor="max-m">Max members</label>
                    </div>

                  </div>
                </div>

                <button type="submit" className="primary-button" disabled={!isAdmin || savingRules} style={{ width: 'fit-content', marginTop: '0.5rem' }}>
                  {savingRules ? (
                    <>
                      <ButtonLoading /> Saving
                    </>
                  ) : (
                    'Save rules'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="account-section settings-card danger-zone" style={{ width: '100%', maxWidth: 'none' }}>
            <div className="account-section-head">
              <h3 style={{ color: '#dc3545' }}>Danger Zone</h3>
              <p>Irreversible actions for this workspace</p>
            </div>

            <div className="danger-zone-content">
              <div className="danger-action">
                <div>
                  <h4>Delete Workspace</h4>
                  <p>Once you delete this workspace, there is no going back. This will permanently delete the workspace, all projects, tasks, and remove all members.</p>
                </div>
                <button
                  type="button"
                  className="primary-button danger-button"
                  onClick={handleDeleteWorkspace}
                  disabled={deletingWorkspace}
                >
                  {deletingWorkspace ? (
                    <>
                      <ButtonLoading /> Deleting...
                    </>
                  ) : (
                    'Delete Workspace'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  )
}

export default Settings
