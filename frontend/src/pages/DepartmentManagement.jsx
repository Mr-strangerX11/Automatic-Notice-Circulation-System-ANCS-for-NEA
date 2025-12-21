import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const OFFICE_TYPES = [
  { value: 'directorate', label: 'Directorate' },
  { value: 'province', label: 'Province' },
  { value: 'province_division', label: 'Province Division' },
  { value: 'division', label: 'Division' },
  { value: 'other', label: 'Other' }
]

const PROVINCES = [
  { value: 'koshi', label: 'Koshi Province', districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'] },
  { value: 'madhesh', label: 'Madhesh Province', districts: ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'] },
  { value: 'bagmati', label: 'Bagmati Province', districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'] },
  { value: 'gandaki', label: 'Gandaki Province', districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'] },
  { value: 'lumbini', label: 'Lumbini Province', districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Palpa', 'Parasi', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi'] },
  { value: 'karnali', label: 'Karnali Province', districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Rukum West', 'Salyan', 'Surkhet'] },
  { value: 'sudurpashchim', label: 'Sudurpashchim Province', districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'] }
]

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([])
  const [showForm, setShowForm] = useState(false)
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    fax: '',
    office_type: 'other',
    parent_office: '',
    province: '',
    district: '',
    address: '',
    photo: ''
  })

  const load = () => api.get('/departments/').then((res) => setDepartments(res.data))

  useEffect(() => { load() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Reset district when province changes
    if (name === 'province') {
      setFormData(prev => ({ ...prev, district: '' }))
    }
  }

  const createDept = async () => {
    if (!formData.name) {
      alert('Office name is required')
      return
    }
    
    try {
      await api.post('/departments/', formData)
      setFormData({
        name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        fax: '',
        office_type: 'other',
        parent_office: '',
        province: '',
        district: '',
        address: '',
        photo: ''
      })
      setShowForm(false)
      load()
    } catch (error) {
      alert('Error creating department: ' + (error.response?.data?.detail || error.message))
    }
  }

  const getDistrictsForProvince = () => {
    const province = PROVINCES.find(p => p.value === formData.province)
    return province ? province.districts : []
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Department Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="px-4 py-2 bg-primary rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Department</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Office Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Office Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                placeholder="e.g., Distribution Center, Kathmandu"
                required
              />
            </div>

            {/* Office Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Office Type</label>
              <select
                name="office_type"
                value={formData.office_type}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
              >
                {OFFICE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Parent Office */}
            <div>
              <label className="block text-sm font-medium mb-2">Parent Office</label>
              <select
                name="parent_office"
                value={formData.parent_office}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
              >
                <option value="">None (Top Level)</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Contact Person - First Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Contact First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                placeholder="First name"
              />
            </div>

            {/* Contact Person - Last Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Contact Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                placeholder="Last name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                placeholder="office@example.com"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                placeholder="+977-1-XXXXXXX"
              />
            </div>

            {/* Fax */}
            <div>
              <label className="block text-sm font-medium mb-2">Fax</label>
              <input
                type="text"
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                placeholder="Fax number"
              />
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium mb-2">Province</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
              >
                <option value="">Select Province</option>
                {PROVINCES.map(prov => (
                  <option key={prov.value} value={prov.value}>{prov.label}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium mb-2">District</label>
              {formData.province ? (
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full bg-slate-700 p-3 rounded"
                >
                  <option value="">Select District</option>
                  {getDistrictsForProvince().map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full bg-slate-700 p-3 rounded"
                  placeholder="Select province first"
                  disabled
                />
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                rows="3"
                placeholder="Full address"
              />
            </div>

            {/* Photo URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Photo URL</label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                className="w-full bg-slate-700 p-3 rounded"
                placeholder="https://example.com/office-photo.jpg"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button 
              onClick={createDept} 
              className="px-6 py-3 bg-primary rounded hover:bg-blue-600"
            >
              Create Department
            </button>
            <button 
              onClick={() => setShowForm(false)} 
              className="px-6 py-3 bg-slate-700 rounded hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Departments List */}
      <div className="space-y-2">
        {departments.map((d) => (
          <div key={d.id} className="bg-slate-800 p-4 rounded">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{d.name}</h3>
                {d.office_type && (
                  <span className="inline-block px-2 py-1 text-xs bg-slate-700 rounded mt-1">
                    {OFFICE_TYPES.find(t => t.value === d.office_type)?.label || d.office_type}
                  </span>
                )}
                
                <div className="mt-2 text-sm text-slate-400 space-y-1">
                  {(d.first_name || d.last_name) && (
                    <div>Contact: {d.first_name} {d.last_name}</div>
                  )}
                  {d.email && <div>Email: {d.email}</div>}
                  {d.phone_number && <div>Phone: {d.phone_number}</div>}
                  {d.fax && <div>Fax: {d.fax}</div>}
                  {d.province && (
                    <div>
                      Location: {PROVINCES.find(p => p.value === d.province)?.label || d.province}
                      {d.district && `, ${d.district}`}
                    </div>
                  )}
                  {d.address && <div>Address: {d.address}</div>}
                  {d.parent_office_name && <div>Parent: {d.parent_office_name}</div>}
                  {d.head && <div>Head: {d.head}</div>}
                </div>
              </div>
              
              {d.photo && (
                <img src={d.photo} alt={d.name} className="w-16 h-16 rounded object-cover ml-4" />
              )}
            </div>
          </div>
        ))}
        
        {departments.length === 0 && (
          <div className="bg-slate-800 p-8 rounded text-center text-slate-400">
            No departments yet. Click "+ Add Department" to create one.
          </div>
        )}
      </div>
    </Layout>
  )
}
