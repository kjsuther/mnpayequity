import { useState, useEffect } from 'react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { ArrowLeft, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase, type Jurisdiction, type Note } from '../lib/supabase';

type NotesProps = {
  jurisdiction: Jurisdiction;
  onBack: () => void;
};

export function Notes({ jurisdiction, onBack }: NotesProps) {
  useScrollToTop();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [jurisdiction.id]);

  async function loadNotes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('jurisdiction_id', jurisdiction.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      alert('Error loading notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleAddNote() {
    setEditingNote(null);
    setIsModalOpen(true);
  }

  function handleEditNote(note: Note) {
    setEditingNote(note);
    setIsModalOpen(true);
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      alert('Note deleted successfully!');
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
            <p className="text-sm text-gray-600">{jurisdiction.name}</p>
          </div>
        </div>
        <button
          onClick={handleAddNote}
          className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded hover:bg-[#004a7f] transition-colors"
        >
          <Plus size={20} />
          Add Note
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'No notes found matching your search.' : 'No notes yet. Click "Add Note" to create one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-2 text-gray-600 hover:text-[#003865] hover:bg-gray-100 rounded transition-colors"
                    title="Edit note"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                    title="Delete note"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap mb-3">{note.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <NoteModal
          note={editingNote}
          jurisdictionId={jurisdiction.id}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            loadNotes();
          }}
        />
      )}
    </div>
  );
}

type NoteModalProps = {
  note: Note | null;
  jurisdictionId: string;
  onClose: () => void;
  onSave: () => void;
};

function NoteModal({ note, jurisdictionId, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSaving(true);

      if (note) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: title.trim(),
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', note.id);

        if (error) throw error;
        alert('Note updated successfully!');
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([
            {
              jurisdiction_id: jurisdictionId,
              title: title.trim(),
              content: content.trim(),
            },
          ]);

        if (error) throw error;
        alert('Note created successfully!');
      }

      onSave();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {note ? 'Edit Note' : 'Add Note'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              placeholder="Enter note title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              placeholder="Enter note content"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#003865] text-white rounded hover:bg-[#004a7f] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
