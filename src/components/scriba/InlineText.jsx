import React, { useEffect, useState } from 'react';

export default function InlineText({ value, onSave, multiline, className = '', placeholder, rows = 4 }) {
  const [v, setV] = useState(value || '');
  const [focus, setFocus] = useState(false);
  useEffect(() => { if (!focus) setV(value || ''); }, [value, focus]);
  const props = {
    value: v,
    placeholder,
    className,
    onChange: (e) => setV(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => { setFocus(false); if (v !== (value || '')) onSave(v); },
  };
  return multiline ? <textarea rows={rows} {...props} /> : <input {...props} />;
}