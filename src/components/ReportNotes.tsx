import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ReportNote = {
  id: string;
  report_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type ReportNotesProps = {
  reportId: string;
};

export function ReportNotes({ reportId }: ReportNotesProps) {
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ReportNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [reportId]);

  async function loadNotes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report_notes')
        .select('*')
        .eq('report_id', reportId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddNote() {
    setEditingNote(null);
    setIsModalOpen(true);
  }

  function handleEditNote(note: ReportNote) {
    setEditingNote(note);
    setIsModalOpen(true);
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('report_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  }

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
        <h3 className="text-lg font-semibold text-gray-900">Case Notes</h3>
        <button
          onClick={handleAddNote}
          className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004a7f] transition-colors"
        >
          <Plus size={18} />
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No notes yet. Click "Add Note" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">{note.title}</h4>
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
                <span>Created: {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}</span>
                {note.updated_at !== note.created_at && (
                  <span>Updated: {new Date(note.updated_at).toLocaleDateString()} {new Date(note.updated_at).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <NoteModal
          note={editingNote}
          reportId={reportId}
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
  note: ReportNote | null;
  reportId: string;
  onClose: () => void;
  onSave: () => void;
};

function NoteModal({ note, reportId, onClose, onSave }: NoteModalProps) {
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
          .from('report_notes')
          .update({
            title: title.trim(),
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', note.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('report_notes')
          .insert([
            {
              report_id: reportId,
              title: title.trim(),
              content: content.trim(),
            },
          ]);

        if (error) throw error;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent resize-none"
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
