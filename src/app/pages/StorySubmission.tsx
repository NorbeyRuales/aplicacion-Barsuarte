import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Image, Send, Upload, XCircle } from 'lucide-react';
import { useOutletContext } from 'react-router';
import { useSupabaseStories } from '../../hooks/useSupabase';
import {
  storiesService,
  uploadStoryImageToStorage,
  type Client,
  type EntrepreneurStory,
} from '../../services/supabase';

interface OutletContext {
  client: Client;
}

const statusStyles: Record<EntrepreneurStory['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<EntrepreneurStory['status'], string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export function StorySubmission() {
  const { client } = useOutletContext<OutletContext>();
  const { stories, refresh } = useSupabaseStories({ clientId: client.id });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleImagePicked = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'err', text: 'Solo puedes subir una imagen.' });
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedImage(null);
    setPreviewUrl('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    if (!title.trim() || !description.trim() || !selectedImage) {
      setNotice({ type: 'err', text: 'Completa el título, la descripción y la imagen.' });
      return;
    }

    if (description.trim().length > 320) {
      setNotice({ type: 'err', text: 'La descripción debe tener máximo 320 caracteres.' });
      return;
    }

    setSubmitting(true);

    try {
      const imageUrl = await uploadStoryImageToStorage(selectedImage);
      if (!imageUrl) {
        setNotice({ type: 'err', text: 'No se pudo subir la imagen. Revisa el bucket story-media en Supabase.' });
        return;
      }

      const created = await storiesService.create({
        clientId: client.id,
        clientName: `${client.name} ${client.surname || ''}`.trim(),
        title: title.trim(),
        description: description.trim(),
        imageUrl,
      });

      if (!created) {
        setNotice({ type: 'err', text: 'No se pudo enviar la historia.' });
        return;
      }

      resetForm();
      await refresh();
      setNotice({ type: 'ok', text: 'Tu emprendimiento fue enviado y queda pendiente de aprobación.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Comparte tu emprendimiento</h2>
              <p className="text-sm text-gray-500">Será publicado cuando un administrador lo apruebe</p>
            </div>
          </div>

          {notice && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${notice.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {notice.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del emprendimiento</label>
              <input
                data-cy="story-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                placeholder="Ej. Tejidos La Esperanza"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción breve</label>
              <textarea
                data-cy="story-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={320}
                rows={5}
                placeholder="Cuenta qué haces, qué representa tu proyecto y qué lo hace especial."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all resize-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">{description.length}/320 caracteres</p>
            </div>

            <div>
              <input
                data-cy="story-image"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImagePicked(event.target.files)}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-fuchsia-300 rounded-xl text-fuchsia-600 hover:border-fuchsia-500 hover:bg-fuchsia-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Image className="w-5 h-5" />
                {selectedImage ? selectedImage.name : 'Seleccionar una imagen'}
              </button>
            </div>

            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img src={previewUrl} alt="Vista previa" className="w-full h-64 object-cover" />
              </div>
            )}

            <button
              data-cy="submit-story-button"
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Enviando...' : 'Enviar para aprobación'}
            </button>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tus envíos</h3>
          {stories.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no has enviado emprendimientos.</p>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {stories.map((story) => (
                <div key={story.id} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                  <img src={story.imageUrl} alt={story.title} className="w-full h-36 object-cover" />
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-gray-800 text-sm">{story.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[story.status]}`}>
                        {statusLabels[story.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">{story.description}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      {story.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : story.status === 'rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {new Date(story.createdAt).toLocaleDateString('es-CO')}
                    </p>
                    {story.adminNotes && (
                      <p className="text-xs text-gray-500 bg-white rounded-lg p-2">{story.adminNotes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
