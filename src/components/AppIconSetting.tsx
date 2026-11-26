import React, { useRef, useState } from 'react';
import { useAppIcon, prepareIcon } from '../hooks/useAppIcon';
import { brand } from '../config/brand';
import { Icon } from './icons/Icon';

export const AppIconSetting: React.FC = () => {
  const { icon, setAppIcon } = useAppIcon();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const shown = preview ?? icon ?? brand.images.appIcon;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMessage(null);
    try {
      setPreview(await prepareIcon(file));
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "That image couldn't be used." });
    }
  };

  const save = async (value: string | null) => {
    setBusy(true);
    const ok = await setAppIcon(value);
    setBusy(false);
    if (ok) {
      setPreview(null);
      setMessage({ ok: true, text: value ? 'Icon saved for everyone.' : 'Back to the built-in icon.' });
    } else {
      setMessage({ ok: false, text: "Couldn't save the icon. Check that supabase-add-app-settings.sql has been run." });
    }
  };

  return (
    <div className="app-icon-setting bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">App Icon</h2>
      <p className="text-sm text-gray-600 mb-4">
        Shown in the browser tab and when someone adds the site to their iPhone home screen. Use a square image;
        anything else is fitted inside a square on the menu bar colour.
      </p>

      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        <div className="flex items-end gap-4 shrink-0">
          <img src={shown} alt="App icon preview" className="app-icon-preview w-24 h-24 rounded-[22%] shadow-md object-cover" />
          <img src={shown} alt="" className="w-8 h-8 rounded-md object-cover" />
          <img src={shown} alt="" className="w-4 h-4 object-cover" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="text-xs text-gray-500">
            {preview ? 'Preview: not saved yet' : icon ? 'Using your uploaded icon' : 'Using the built-in icon'}
          </div>
          <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div className="flex flex-wrap gap-3">
            {preview ? (
              <>
                <button
                  onClick={() => save(preview)}
                  disabled={busy}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition disabled:opacity-50"
                >
                  <Icon name="save" /> Save Icon
                </button>
                <button
                  onClick={() => setPreview(null)}
                  disabled={busy}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition"
                >
                  Upload Image
                </button>
                {icon && (
                  <button
                    onClick={() => save(null)}
                    disabled={busy}
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Use Built-in Icon
                  </button>
                )}
              </>
            )}
          </div>
          {message && (
            <div className={`text-sm ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Phones that already added the site keep their old icon until it's added again. Android and desktop installs use the
        built-in icon in <code className="bg-gray-100 px-1 rounded">public/icons/</code>.
      </p>
    </div>
  );
};
