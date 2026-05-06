import React, { useState } from 'react'
import { TemplateList } from '../../components/TemplateList'
import { TemplateForm } from '../../components/TemplateForm'
import { TemplateDetailDto, getTemplateById } from '../../api/templates'
import styles from '../../styles/AdminPage.module.scss'

type Tab = 'templates' | 'users'
type TemplateViewMode = 'list' | 'create' | 'edit'

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('templates')
  const [templateViewMode, setTemplateViewMode] = useState<TemplateViewMode>('list')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetailDto | undefined>()
  const [loading, setLoading] = useState(false)

  const handleEditTemplate = async (templateId: number) => {
    setLoading(true)
    try {
      const template = await getTemplateById(templateId)
      setSelectedTemplate(template)
      setTemplateViewMode('edit')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(undefined)
    setTemplateViewMode('create')
  }

  const handleTemplateFormSubmit = (templateId?: number) => {
    setTemplateViewMode('list')
    setSelectedTemplate(undefined)
  }

  const handleTemplateFormCancel = () => {
    setTemplateViewMode('list')
    setSelectedTemplate(undefined)
  }

  const handleTemplateListRefresh = () => {
    // Trigger refresh of template list
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage templates, categories, and users</p>
      </header>

      <div className={styles.container}>
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </nav>

        <div className={styles.content}>
          {/* Templates Section */}
          {activeTab === 'templates' && (
            <section className={styles.section}>
              {templateViewMode === 'list' ? (
                <>
                  <div className={styles.sectionHeader}>
                    <h2>Template Management</h2>
                    <button
                      onClick={handleCreateTemplate}
                      className={styles.primaryBtn}
                    >
                      + Create Template
                    </button>
                  </div>
                  <TemplateList
                    onEdit={handleEditTemplate}
                    onRefresh={handleTemplateListRefresh}
                  />
                </>
              ) : templateViewMode === 'create' ? (
                <TemplateForm
                  onSubmit={handleTemplateFormSubmit}
                  onCancel={handleTemplateFormCancel}
                />
              ) : templateViewMode === 'edit' ? (
                <TemplateForm
                  template={selectedTemplate}
                  onSubmit={handleTemplateFormSubmit}
                  onCancel={handleTemplateFormCancel}
                />
              ) : null}
            </section>
          )}

          {/* Users Section */}
          {activeTab === 'users' && (
            <section className={styles.section}>
              <h2>User Management</h2>
              <div className={styles.placeholder}>
                User management features coming soon...
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage
