import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchLoans, addLoan, deleteLoan } from '@/store/slices/loanSlice'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import LoanCard from '@/components/loans/LoanCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const schema = z.object({
  loanType: z.string().min(1, 'Select loan type'),
  principal: z.coerce.number().min(1000, 'Min ₹1,000'),
  interestRate: z.coerce.number().min(0.1).max(36),
  tenureMonths: z.coerce.number().min(1).max(360),
  startDate: z.string().min(1, 'Required'),
  lenderName: z.string().optional(),
  notes: z.string().optional()
})
type Form = z.infer<typeof schema>

export default function LoansPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { loans, loading, error } = useSelector((s: RootState) => s.loans)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  useEffect(() => { dispatch(fetchLoans()) }, [])

  const onSubmit = async (data: Form) => {
    await dispatch(addLoan(data))
    reset()
    setShowForm(false)
    dispatch(fetchLoans())
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="page-title" style={{ marginBottom: 0 }}>My Loans</div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Loan'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">New Loan</div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-3">
              <div className="form-group">
                <label>Loan Type</label>
                <select {...register('loanType')}>
                  <option value="">Select type</option>
                  {['HOME', 'CAR', 'PERSONAL', 'EDUCATION', 'GOLD', 'CREDIT_CARD', 'OTHER'].map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
                {errors.loanType && <div className="error-msg">{errors.loanType.message}</div>}
              </div>
              <div className="form-group">
                <label>Principal Amount (₹)</label>
                <input type="number" placeholder="3000000" {...register('principal')} />
                {errors.principal && <div className="error-msg">{errors.principal.message}</div>}
              </div>
              <div className="form-group">
                <label>Interest Rate (% p.a.)</label>
                <input type="number" step="0.1" placeholder="8.5" {...register('interestRate')} />
              </div>
              <div className="form-group">
                <label>Tenure (Months)</label>
                <input type="number" placeholder="240" {...register('tenureMonths')} />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" {...register('startDate')} />
                {errors.startDate && <div className="error-msg">{errors.startDate.message}</div>}
              </div>
              <div className="form-group">
                <label>Lender Name</label>
                <input placeholder="HDFC Bank" {...register('lenderName')} />
              </div>
            </div>
            {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Adding…' : 'Add Loan'}
            </button>
          </form>
        </div>
      )}

      {loading && <LoadingSpinner label="Loading your loans…" />}

      {!loading && loans.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No loans yet</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Add your loans to start tracking EMI, interest, and get risk analysis
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add First Loan</button>
        </div>
      )}

      {loans.map(loan => (
        <LoanCard key={loan.id} loan={loan} onDelete={id => dispatch(deleteLoan(id))} />
      ))}
    </div>
  )
}
