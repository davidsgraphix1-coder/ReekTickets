import { FaStore, FaSync, FaPlus, FaStar } from 'react-icons/fa';

export default function VendorManagement({ vendors, onRefresh }) {
  const vendorList = vendors || [];

  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon"><FaStore /></div>
        <h1>Vendor Management</h1>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={onRefresh}>
          <FaSync /> Refresh Vendors
        </button>
        <button className="btn btn-primary">
          <FaPlus /> Add Vendor
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Type</th>
              <th>Events</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendorList.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No vendor records found.</td>
              </tr>
            ) : (
              vendorList.map(vendor => (
                <tr key={vendor._id} className="table-row-hover">
                  <td><strong>{vendor.fullName || vendor.email}</strong></td>
                  <td>{vendor.company || 'Vendor'}</td>
                  <td>{vendor.eventsCount || 0}</td>
                  <td><FaStar /> {vendor.rating || 'N/A'}</td>
                  <td><span className="badge" style={{ 
                    backgroundColor: vendor.status === 'active' ? '#E6F4EA' : '#FFF3CD',
                    color: vendor.status === 'active' ? '#0D652D' : '#856404'
                  }}>{vendor.status || 'unknown'}</span></td>
                  <td>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
