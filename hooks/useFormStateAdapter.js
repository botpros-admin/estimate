import { useEffect, useCallback, useRef } from 'react';
import { useContractState } from './useContractState';

/**
 * Hook to integrate contract builder with existing paint estimator formState
 * Provides bidirectional data synchronization
 */
export function useFormStateAdapter() {
  const { state: contractState, setState: setContractState } = useContractState();
  const lastSyncRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  /**
   * Map formState data to contract state format
   */
  const mapFormStateToContract = useCallback((formStateData) => {
    if (!formStateData) return {};

    // Get primary contact
    const primaryContact = formStateData.contacts?.[0] || {};
    
    // Map site address
    const siteAddress = formStateData.siteAddress || {};
    
    // Map surfaces from rooms data
    const surfaces = [];
    if (formStateData.rooms && Array.isArray(formStateData.rooms)) {
      formStateData.rooms.forEach((room, roomIndex) => {
        if (room.surfaces && Array.isArray(room.surfaces)) {
          room.surfaces.forEach((surface) => {
            surfaces.push({
              id: `${roomIndex}-${surface.id || surfaces.length}`,
              location: room.name || `Room ${roomIndex + 1}`,
              type: surface.type || 'walls',
              area: parseFloat(surface.area || 0),
              condition: surface.condition || 'good',
              coats: parseInt(surface.coats || 2),
              preparation: surface.preparation || []
            });
          });
        }
      });
    }
    
    return {
      // Basic info mapping
      estimateNumber: formStateData.estimateNumber || contractState.estimateNumber,
      projectName: formStateData.projectName || contractState.projectName,
      companyName: formStateData.companyName || contractState.companyName,
      clientName: primaryContact.name || contractState.clientName,      clientEmail: primaryContact.email || contractState.clientEmail,
      clientPhone: primaryContact.phone || contractState.clientPhone,
      clientAddress: `${siteAddress.street || ''} ${siteAddress.city || ''} ${siteAddress.state || ''} ${siteAddress.zip || ''}`.trim(),
      
      // Scope of work mapping
      surfaces: surfaces.length > 0 ? surfaces : contractState.surfaces,
      
      // Materials mapping
      selectedProducts: formStateData.selectedProducts || contractState.selectedProducts,
      
      // Terms and payment mapping
      estimatedDuration: formStateData.laborHours ? `${Math.ceil(formStateData.laborHours / 8)} days` : contractState.estimatedDuration,
      paymentSchedule: formStateData.paymentSchedule || contractState.paymentSchedule,
      totalAmount: parseFloat(formStateData.totalPrice || formStateData.subtotal || 0),
      
      // Additional mappings
      warrantyPeriod: formStateData.warrantyPeriod || contractState.warrantyPeriod,
      startDate: formStateData.startDate || contractState.startDate,
      validUntil: formStateData.validUntil || contractState.validUntil
    };
  }, [contractState]);

  /**
   * Map contract state back to formState format
   */
  const mapContractToFormState = useCallback((contractData) => {
    if (!contractData) return {};
    
    // Parse client address
    const addressParts = (contractData.clientAddress || '').split(' ');
    const zip = addressParts.pop() || '';
    const state = addressParts.pop() || '';
    const city = addressParts.pop() || '';
    const street = addressParts.join(' ');
    
    return {
      // Basic info reverse mapping
      estimateNumber: contractData.estimateNumber,
      projectName: contractData.projectName,
      companyName: contractData.companyName,
      contacts: [{
        name: contractData.clientName,
        email: contractData.clientEmail,
        phone: contractData.clientPhone,
        role: 'Primary'
      }],
      siteAddress: {
        street,
        city,
        state,
        zip
      },      
      // Rooms/surfaces reverse mapping
      rooms: contractData.surfaces ? contractData.surfaces.reduce((rooms, surface) => {
        const roomName = surface.location;
        let room = rooms.find(r => r.name === roomName);
        
        if (!room) {
          room = { name: roomName, surfaces: [] };
          rooms.push(room);
        }
        
        room.surfaces.push({
          type: surface.type,
          area: surface.area,
          condition: surface.condition,
          coats: surface.coats,
          preparation: surface.preparation
        });
        
        return rooms;
      }, []) : [],
      
      // Other mappings
      selectedProducts: contractData.selectedProducts,
      laborHours: contractData.estimatedDuration ? parseInt(contractData.estimatedDuration) * 8 : 0,
      totalPrice: contractData.totalAmount,
      warrantyPeriod: contractData.warrantyPeriod,
      startDate: contractData.startDate,
      validUntil: contractData.validUntil
    };
  }, []);

  /**
   * Sync formState to contract state
   */
  const syncFromFormState = useCallback(() => {
    if (typeof window !== 'undefined' && window.formState && window.formState.data) {
      const mappedData = mapFormStateToContract(window.formState.data);
      setContractState(mappedData);
      lastSyncRef.current = Date.now();
    }
  }, [mapFormStateToContract, setContractState]);

  /**
   * Sync contract state back to formState
   */
  const syncToFormState = useCallback(() => {
    if (typeof window !== 'undefined' && window.formState) {
      const mappedData = mapContractToFormState(contractState);
      
      // Merge with existing formState data      window.formState.data = {
        ...window.formState.data,
        ...mappedData
      };
      
      // Save to localStorage
      if (window.formState.saveState) {
        window.formState.saveState();
      }
      
      lastSyncRef.current = Date.now();
    }
  }, [contractState, mapContractToFormState]);

  /**
   * Debounced sync to prevent excessive updates
   */
  const debouncedSync = useCallback((syncFn) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      syncFn();
    }, 500); // 500ms debounce
  }, []);

  // Initial sync from formState on mount
  useEffect(() => {
    syncFromFormState();
  }, [syncFromFormState]);

  // Watch for formState changes
  useEffect(() => {
    const checkFormStateChanges = () => {
      if (typeof window !== 'undefined' && window.formState && window.formState.data) {
        const formStateTimestamp = window.formState.lastModified || 0;
        if (formStateTimestamp > (lastSyncRef.current || 0)) {
          syncFromFormState();
        }
      }
    };

    const interval = setInterval(checkFormStateChanges, 1000);
    return () => clearInterval(interval);
  }, [syncFromFormState]);

  // Auto-sync contract state changes back to formState
  useEffect(() => {
    debouncedSync(syncToFormState);
  }, [contractState, debouncedSync, syncToFormState]);

  return {
    syncFromFormState,
    syncToFormState,
    isInSync: !!lastSyncRef.current
  };
}

export default useFormStateAdapter;