import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Book a Room page — see README.md "Your task".
// This page is already routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO (edit mode): when there is an `id`, load the booking and fill the form.
  useEffect(() => {
    setError('')

    if (!id) {
      setForm(defaults)
      return
    }

    let active = true

    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        const booking = data.booking
        if (active) {
          setForm({
            roomNumber: booking.roomNumber,
            startDate: booking.startDate.slice(0, 10),
            endDate: booking.endDate.slice(0, 10),
            purpose: booking.purpose || ''
          })
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load booking')
        }
      }
    }

    loadBooking()

    return () => {
      active = false
    }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  // TODO: POST a new booking, or PATCH the existing one when editing,
  // then go back to /bookings. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
      }
      nav('/bookings')
    } catch (err) {
      const message = err.response?.data?.message

      if (
        message?.includes('"endDate"') &&
        message?.includes('ref:startDate')
      ) {
        setError('End date must be after start date.')
      } else {
        setError(message || 'Failed to save booking')
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {/* TODO: room number input, start/end date inputs and purpose textarea */}
        <label className="block">
          Room number
          <input
            className="w-full border rounded p-2"
            type="text"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
            required
          />
        </label>

        <label className="block">
          Start date
          <input
            className="w-full border rounded p-2"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block">
          End date
          <input
            className="w-full border rounded p-2"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block">
          Purpose (optional)
          <textarea
            className="w-full border rounded p-2"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            rows={3}
          />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
