'use client';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>Delete</Button>
      </div>
    </Modal>
  );
}
