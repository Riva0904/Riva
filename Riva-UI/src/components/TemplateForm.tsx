import React, { useState, useEffect } from 'react'
import { AddTemplateRequest, UpdateTemplateRequest, addTemplate, updateTemplate, TemplateDetailDto } from '../api/templates'
import { CategoryDto, getCategories } from '../api/categories'
import styles from '../styles/TemplateForm.module.scss'

interface TemplateFormProps {
  template?: TemplateDetailDto
  onSubmit: (templateId?: number) => void
  onCancel: () => void
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: template?.name || '',
    categoryId: template?.categoryId || 0,
    isPaid: template?.isPaid || false,
    price: template?.price || null,
    templateHtml: template?.templateHtml || '',
    templateCss: template?.templateCss || '',
    templateJs: template?.templateJs || '',
    schemaJson: template?.schemaJson || '[]',
    previewImageUrl: template?.previewImageUrl || '',
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? parseFloat(value) : null }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.name || !formData.categoryId || !formData.templateHtml) {
        setError('Please fill in all required fields')
        return
      }

      if (template) {
        const request: UpdateTemplateRequest = formData
        await updateTemplate(template.templateId, request)
      } else {
        const request: AddTemplateRequest = formData
        await addTemplate(request)
      }

      onSubmit(template?.templateId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  if (categoriesLoading) {
    return <div className={styles.loading}>Loading categories...</div>
  }

  return (
    <div className={styles.formContainer}>
      <h2>{template ? 'Edit Template' : 'Create New Template'}</h2>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info */}
        <fieldset>
          <legend>Basic Information</legend>

          <div className={styles.formGroup}>
            <label htmlFor="name">
              Template Name <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g., Classic Birthday Card"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="categoryId">
              Category <span className={styles.required}>*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              disabled={loading || categories.length === 0}
              className={styles.select}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  disabled={loading}
                />
                This is a paid template
              </label>
            </div>

            {formData.isPaid && (
              <div className={styles.formGroup}>
                <label htmlFor="price">Price (₹)</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={formData.price || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  disabled={loading}
                  className={styles.input}
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Template Content */}
        <fieldset>
          <legend>Template Content</legend>

          <div className={styles.formGroup}>
            <label htmlFor="templateHtml">
              HTML Template <span className={styles.required}>*</span>
            </label>
            <textarea
              id="templateHtml"
              name="templateHtml"
              placeholder="Enter HTML template"
              value={formData.templateHtml}
              onChange={handleChange}
              required
              disabled={loading}
              rows={6}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="templateCss">CSS Styles</label>
            <textarea
              id="templateCss"
              name="templateCss"
              placeholder="Enter CSS styles"
              value={formData.templateCss}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="templateJs">JavaScript</label>
            <textarea
              id="templateJs"
              name="templateJs"
              placeholder="Enter JavaScript code"
              value={formData.templateJs}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="schemaJson">Template Schema (JSON)</label>
            <textarea
              id="schemaJson"
              name="schemaJson"
              placeholder='[{"key":"title","label":"Title","type":"text","required":true}]'
              value={formData.schemaJson}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="previewImageUrl">Preview Image URL</label>
            <input
              id="previewImageUrl"
              type="url"
              name="previewImageUrl"
              placeholder="https://example.com/preview.jpg"
              value={formData.previewImageUrl}
              onChange={handleChange}
              disabled={loading}
              className={styles.input}
            />
          </div>
        </fieldset>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </div>
  )
}
