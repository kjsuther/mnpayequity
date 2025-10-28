import { Edit2, Trash2, Mail, Phone, UserPlus } from 'lucide-react';
import type { Contact } from '../lib/supabase';

interface ContactListProps {
  contacts: Contact[];
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
}

export function ContactList({
  contacts,
  onAddContact,
  onEditContact,
  onDeleteContact,
}: ContactListProps) {
  const handleDelete = (contact: Contact) => {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      onDeleteContact(contact.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <button
          onClick={onAddContact}
          className="flex items-center gap-2 px-4 py-2 bg-[#78BE21] text-white rounded hover:bg-[#6ba91d] transition-colors"
        >
          <UserPlus size={16} />
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No contacts yet. Click "Add Contact" to create one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                  Title
                </th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                  Primary
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                  Phone
                </th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => (
                <tr
                  key={contact.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm">{contact.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {contact.title}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {contact.is_primary && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#78BE21] text-white">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 text-[#003865] hover:text-[#008EAA] no-underline"
                      >
                        <Mail size={14} />
                        {contact.email}
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {contact.phone && (
                      <span className="flex items-center gap-1 text-gray-700">
                        <Phone size={14} />
                        {contact.phone}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEditContact(contact)}
                        className="p-2 text-[#003865] hover:bg-gray-200 rounded transition-colors"
                        title="Edit contact"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
