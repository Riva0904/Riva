import React, { useState } from 'react'
import { VerifyOtpRequest, ResendOtpRequest, verifyOtp, resendOtp } from '../api/auth'
import styles from '../styles/OtpModal.module.scss'

interface OtpModalProps {
  email: string
  isOpen: boolean
  onSuccess: (token: string, username: string, email: string) => void
  onClose: () => void
}

export const OtpModal: React.FC<OtpModalProps> = ({ email, isOpen, onSuccess, onClose }) => {
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [expiryMinutes, setExpiryMinutes] = useState(10)

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const request: VerifyOtpRequest = {
        email,
        otpCode,
      }

      const response = await verifyOtp(request)

      if (response.isVerified && response.token && response.username) {
        onSuccess(response.token, response.username, email)
        setOtpCode('')
      } else {
        setError(response.message || 'OTP verification failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setResendLoading(true)

    try {
      const request: ResendOtpRequest = { email }
      const response = await resendOtp(request)

      if (response.success) {
        setExpiryMinutes(response.otpExpiryMinutes)
        setError(null)
      } else {
        setError(response.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setResendLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Verify Your Email</h2>
        <p className={styles.subtitle}>
          We've sent a verification code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerifyOtp} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="otp">Verification Code</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
              maxLength={6}
              className={styles.input}
              disabled={loading}
            />
            <small className={styles.hint}>Code expires in {expiryMinutes} minutes</small>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className={styles.resendLink}
            >
              {resendLoading ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
