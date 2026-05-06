import React, { useEffect, useState } from 'react'
import { TemplateListItemDto, getTemplates, deleteTemplate, GetTemplatesRequest } from '../api/templates'
import { CategoryDto, getCategories } from '../api/categories'
import styles from '../styles/TemplateList.module.scss'

interface TemplateListProps {
  onEdit: (templateId: number) => void
  onRefresh?: () => void
}

export const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onRefresh }) => {
  const [templates, setTemplates] = useState<TemplateListItemDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()
  const [paidOnly, setPaidOnly] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  const loadTemplates = async () => {
    setLoading(true)
    setError(null)

    try {
      const filters: GetTemplatesRequest = {
        categoryId: selectedCategory,
        isPaid: paidOnly ? true : undefined,
      }

      const result = await getTemplates(filters)
      setTemplates(result.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [selectedCategory, paidOnly])

  const handleDelete = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    setDeleteLoading(templateId)
    setError(null)

    try {
      await deleteTemplate(templateId)
      setTemplates(templates.filter((t) => t.templateId !== templateId))
      onRefresh?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className={styles.container}>
      <h2>Templates</h2>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
            className={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>
            <input
              type="checkbox"
              checked={paidOnly}
              onChange={(e) => setPaidOnly(e.target.checked)}
            />
            Paid Only
          </label>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className={styles.empty}>No templates found</div>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.templateId}>
                  <td className={styles.name}>{template.name}</td>
                  <td>{template.categoryName}</td>
                  <td>
                    <span className={`${styles.badge} ${template.isPaid ? styles.paid : styles.free}`}>
                      {template.isPaid ? 'Paid' : 'Free'}
                    </span>
                  </td>
                  <td>
                    {template.isPaid && template.price ? `₹${template.price.toFixed(2)}` : '-'}
                  </td>
                  <td>{template.createdByUsername}</td>
                  <td>{new Date(template.createdDate).toLocaleDateString()}</td>
                  <td className={styles.actions}>
                    <button
                      onClick={() => onEdit(template.templateId)}
                      className={styles.editBtn}
                      title="Edit template"
                      disabled={deleteLoading === template.templateId}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.templateId)}
                      className={styles.deleteBtn}
                      title="Delete template"
                      disabled={deleteLoading === template.templateId}
                    >
                      {deleteLoading === template.templateId ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
