import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getEmployees, deleteEmployee, updateEmployee, createEmployee } from '../api/employees.js';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { AuthContext } from '../context/AuthContext.jsx';

const EmployeesTable = () => {
  const { authToken ,user} = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [employeeData, setEmployeeData] = useState(null); // State for employee to be updated
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
  const [modalAddOpen, setModalAddOpen] = useState(false); // State to control modal visibility

  // Fetch employees
  const { data, isLoading, isError, error } = useQuery(
    ['employees', pageIndex], // Unique query key including pageIndex for cache management
    () => getEmployees(pageIndex + 1, pageSize, authToken), // Fetching function
    {
      staleTime: 5000, // Optional: Data considered fresh for 5 seconds
      cacheTime: 60000, // Optional: Cache time for 1 minute
      refetchOnWindowFocus: false, // Optional: Disable refetching on window focus
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    ({ id, authToken }) => deleteEmployee(id, authToken), // Pass both `id` and `token`
    {
      onSuccess: () => {
        // Invalidate the 'employees' query to refresh the list
        queryClient.invalidateQueries('employees');
        alert('Employee Deleted. Email sent to employee');

      },
      onError: (error) => {
        console.error('Error deleting employee:', error);
        alert('Failed to delete the employee. Please try again.'); // Optional: Show a user-friendly message
      },
    }
  );

  // Update mutation
  const updateMutation = useMutation(
    ({ id, updatedData, authToken }) => updateEmployee(id, updatedData, authToken), // Update API call
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        setModalOpen(false); // Close the modal on success
        alert('Employee Details Updated. Email sent to employee');

      },
      onError: (error) => {
        console.error('Error updating employee:', error);
        alert('Failed to update the employee. Please try again.');
      },
    }
  );
  const addMutation = useMutation(
    ({ employeeNewData, authToken }) => createEmployee(employeeNewData, authToken ), {
    onSuccess: (newEmployee) => {
      // Invalidate and refetch employees data to include the new employee
      queryClient.invalidateQueries('employees'); // Ensure your query name matches
      setModalAddOpen(false)
      alert('Employee added successfully');
      // Reset form after successful submission
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Error adding employee');
    },
  });
  const handleAddEmployee = ()=>{
    setModalAddOpen(true)

  }
  const handleAddSubmit = (employeeNewData) => {
    const token = authToken;
    addMutation.mutate({employeeNewData, authToken: token }); // Call mutation to create employee
  };
  const actionColumn = user.role === 'Regular' ? [] : user.role === 'Manager' ? [
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {/* Update Button */}
          <button
            onClick={() => handleUpdate(row.original)} // Trigger update modal or logic
            className="text-blue-500 hover:underline"
          >
            Update
          </button>
          </div>
      ),
    },
  ]: [
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {/* Update Button */}
          <button
            onClick={() => handleUpdate(row.original)} // Trigger update modal or logic
            className="text-blue-500 hover:underline"
          >
            Update
          </button>

          {/* Delete Button */}
          <button
            onClick={() => deleteMutation.mutate({ id: row.original._id, authToken })}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'position',
        header: 'Position',
      },
      {
        accessorKey: 'department',
        header: 'Department',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'profilePicture', // Assuming this column has the image URL
        header: 'Profile Picture',
        cell: ({ row }) => {
          const profileUrl = row.original.profilePicture;
          return profileUrl ? (
            <img
              src={profileUrl}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full" // Optional: Apply some styling to the image
            />
          ) : (
            <span>No Image</span> // Display text if the image is missing
          );
        },
      },
      ...actionColumn,
    ],
    [deleteMutation, authToken]
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    pageCount: Math.ceil((data?.data.length || 0) / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination = updater({ pageIndex, pageSize });
      setPageIndex(newPagination.pageIndex);
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  console.log(table.getRowModel().rows);
  
  // Open the modal and populate the employee data for editing
  const handleUpdate = (employee) => {
    setEmployeeData(employee); // Populate modal form with employee data
    setModalOpen(true); // Open modal
  };

  // Handle submit for update
  const handleSubmit = (updatedData) => {
    const token = authToken;
    updateMutation.mutate({ id: employeeData._id, updatedData, authToken: token });
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {user.role ==='Regular' ? null : (
         <button
            onClick={handleAddEmployee}
                type="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add New Employee
              </button>
      )}
      <table className="table-auto w-full border">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border px-4 py-2 bg-gray-200">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border px-4 py-2 text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="btn-primary"
        >
          Previous
        </button>
        <span>
          Page <strong>{pageIndex + 1}</strong> of{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="btn-primary"
        >
          Next
        </button>
      </div>

      {/* Update Employee Modal */}
      {modalOpen && (
        <EmployeeUpdateModal
          employee={employeeData}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
      {modalAddOpen && (
        <AddEmployeeModal
          onClose={() => setModalAddOpen(false)}
          onSubmit={handleAddSubmit}
        />
      )}
    </div>
  );
};

// Modal for updating employee data
const EmployeeUpdateModal = ({ employee, onClose, onSubmit }) => {
    const [updatedData, setUpdatedData] = useState(employee);
    
    // Handle text input changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setUpdatedData({ ...updatedData, [name]: value });
    };
    
    // Handle profile file input changes
    const handleFile = (e) => {
      const profile = e.target.files[0];
      setUpdatedData({ ...updatedData, profile });
    };
  
    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
  
      // Create FormData to include both text data and the profile image
      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('email', updatedData.email);
      formData.append('position', updatedData.position);
      formData.append('department', updatedData.department);
      formData.append('status', updatedData.status);
      
      // Append the profile image if it's selected
      if (updatedData.profile) {
        formData.append('profilePicture', updatedData.profile);
      }
  
      // Submit the data to the parent onSubmit function
      onSubmit(formData);
    };
  
    return (
        <div className="modal fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Update Employee</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={updatedData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={updatedData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            {/* Position Input */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                name="position"
                value={updatedData.position}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            {/* Department Input */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                name="department"
                value={updatedData.department}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={updatedData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
            {/* Profile Image Upload */}
            <div>
              <label htmlFor="profile" className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <input
                type="file"
                name="profile"
                onChange={handleFile}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
      
    );
  };


const AddEmployeeModal = ({ onClose, onSubmit }) => {
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    dateOfJoining: '',
    status: 'Active',
    profile:[]
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: value });
  };

  // Handle file input for profile picture
  const handleFile = (e) => {
    const profile = e.target.files[0];
    setEmployeeData({ ...employeeData, profile });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', employeeData.name);
    formData.append('email', employeeData.email);
    formData.append('position', employeeData.position);
    formData.append('department', employeeData.department);
    formData.append('dateOfJoining', employeeData.dateOfJoining);
    formData.append('status', employeeData.status);
    formData.append('profilePicture', employeeData.profile);
    
    onSubmit(formData); // Pass the form data to the parent component (or API)
  };

  return (
    <div className="modal fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={employeeData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={employeeData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Position Input */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              name="position"
              value={employeeData.position}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department Input */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              name="department"
              value={employeeData.department}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date of Joining Input */}
          <div>
            <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700">Date of Joining</label>
            <input
              type="date"
              name="dateOfJoining"
              value={employeeData.dateOfJoining}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
              <label htmlFor="profile" className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <input
                type="file"
                name="profile"
                onChange={handleFile}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          {/* Status Select */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={employeeData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default EmployeesTable;
