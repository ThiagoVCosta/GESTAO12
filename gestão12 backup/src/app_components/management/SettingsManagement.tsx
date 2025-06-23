

import React, { useState, useRef } from 'react';
import { ChecklistItemConfig } from '../../types';
import { PlusIcon, DeleteIcon, GripVerticalIcon } from '../../constants';
import Spinner from '../ui/Spinner';
import './ManagementPages.css'; // Shared styles
import './SettingsManagement.css'; // Specific styles

interface SettingsManagementProps {
  // locations: string[]; // Removed
  checklistItems: ChecklistItemConfig[];
  // onAddLocation: (name: string) => Promise<void>; // Removed
  // onDeleteLocation: (name: string) => void;  // Removed
  onAddChecklistItem: (itemConfig: Omit<ChecklistItemConfig, 'id'>) => Promise<void>;
  onDeleteChecklistItem: (itemId: string) => void; 
  onUpdateChecklistOrder: (reorderedItems: ChecklistItemConfig[]) => Promise<void>;
  isLoading: boolean;
}

const SettingsManagement: React.FC<SettingsManagementProps> = ({
  // locations, // Removed
  checklistItems,
  // onAddLocation, // Removed
  // onDeleteLocation, // Removed
  onAddChecklistItem,
  onDeleteChecklistItem,
  onUpdateChecklistOrder,
  isLoading,
}) => {
  // const [newLocationName, setNewLocationName] = useState(''); // Removed
  const [newChecklistItemLabel, setNewChecklistItemLabel] = useState('');
  const [newChecklistItemType, setNewChecklistItemType] = useState<'text' | 'number' | 'boolean' | 'textarea'>('boolean');
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const dragOverItemRef = useRef<string | null>(null); // To store the ID of the item being dragged over

  // const handleAddLocationSubmit = (e: React.FormEvent) => { // Removed
  //   e.preventDefault();
  //   if (newLocationName.trim()) {
  //     onAddLocation(newLocationName.trim());
  //     setNewLocationName('');
  //   } else {
  //     alert("O nome do local não pode ser vazio.");
  //   }
  // };

  const handleAddChecklistItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistItemLabel.trim()) {
      onAddChecklistItem({
        label: newChecklistItemLabel.trim(),
        type: newChecklistItemType,
        defaultValue: newChecklistItemType === 'boolean' ? false : '', // Changed to false for boolean
        required: false, 
      });
      setNewChecklistItemLabel('');
      setNewChecklistItemType('boolean');
    } else {
      alert("O nome do item do checklist não pode ser vazio.");
    }
  };

  // Drag and Drop Handlers for Checklist Items
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    setDraggedItemId(itemId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, targetItemId: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedItemId && draggedItemId !== targetItemId) {
      dragOverItemRef.current = targetItemId;
      // Add class to target element for visual feedback (e.g., border top/bottom)
      // This needs to be efficient or managed with state if direct DOM manipulation is avoided
      document.querySelectorAll('.checklist-item-draggable.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
      e.currentTarget.classList.add('drag-over-target');
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('drag-over-target');
    dragOverItemRef.current = null;
  }

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetItemId: string) => {
    e.preventDefault();
    document.querySelectorAll('.checklist-item-draggable.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
    
    const sourceItemId = draggedItemId; // Use state for source item ID
    if (!sourceItemId || sourceItemId === targetItemId) {
      setDraggedItemId(null);
      return;
    }

    const itemsCopy = [...checklistItems];
    const sourceIndex = itemsCopy.findIndex(item => item.id === sourceItemId);
    const targetIndex = itemsCopy.findIndex(item => item.id === targetItemId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedItemId(null);
      return;
    }
    
    const [draggedItem] = itemsCopy.splice(sourceIndex, 1);
    // Adjust targetIndex if sourceIndex was before targetIndex
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex -1 : targetIndex;
    itemsCopy.splice(adjustedTargetIndex, 0, draggedItem);
    
    onUpdateChecklistOrder(itemsCopy);
    setDraggedItemId(null);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.checklist-item-draggable.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
    setDraggedItemId(null);
    dragOverItemRef.current = null;
  };


  return (
    <div className="management-page settings-management">
      <h3 className="management-title">Configurações Gerais</h3>
      {isLoading && <Spinner message="Salvando configurações..." />}

      <div className="settings-grid">
        {/* Location Management Card Removed */}

        {/* Checklist Item Management Card */}
        <div className="setting-card">
          <h4 className="setting-card-title">Gestão de Itens do Checklist</h4>
          <ul className="settings-list checklist-items-list">
            {checklistItems.map(item => (
              <li 
                key={item.id} 
                className={`settings-list-item checklist-item-draggable ${item.isFixed ? 'fixed-item' : ''} ${draggedItemId === item.id ? 'dragging-placeholder' : ''}`}
                draggable={true} // All items are draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                title={item.isFixed ? "Item fixo (não pode ser excluído, mas pode ser reordenado)" : "Arraste para reordenar"}
              >
                <GripVerticalIcon className="drag-handle-icon" />
                <span className="checklist-item-label-text">{item.label} <span className="item-type">({item.type === 'boolean' ? 'Verificação (OK/Não OK)' : item.type})</span></span>
                <div className="item-actions">
                  {!item.isFixed && (
                    <button 
                      className="action-button delete" 
                      title={`Excluir item ${item.label}`}
                      onClick={() => onDeleteChecklistItem(item.id)}
                      disabled={isLoading}
                    >
                      <DeleteIcon />
                    </button>
                  )}
                  {item.isFixed && (
                    <span className="fixed-item-indicator" title="Este item é fixo e não pode ser excluído.">Fixo</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {checklistItems.length === 0 && <p className="empty-list-info">Nenhum item de checklist cadastrado.</p>}
          <form onSubmit={handleAddChecklistItemSubmit} className="add-item-form checklist-add-form">
            <input
              type="text"
              value={newChecklistItemLabel}
              onChange={(e) => setNewChecklistItemLabel(e.target.value)}
              placeholder="Nome do Novo Item"
              disabled={isLoading}
            />
            <select 
              value={newChecklistItemType} 
              onChange={(e) => setNewChecklistItemType(e.target.value as any)}
              disabled={isLoading}
            >
              <option value="boolean">Verificação (OK/Não OK)</option>
              <option value="text">Texto</option>
              <option value="number">Numérico</option>
              <option value="textarea">Área de Texto</option>
            </select>
            <button type="submit" className="button add-button-inline" disabled={isLoading}>
              <PlusIcon /> Adicionar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
