import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity contract testing environment
const mockContractState = {
  assets: new Map(),
  nextAssetId: 1
};

const mockTxSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const mockBlockHeight = 100;

// Mock contract functions
const assetVerificationContract = {
  registerAsset: (assetType, location, metadata) => {
    const assetId = mockContractState.nextAssetId;
    mockContractState.assets.set(assetId, {
      assetType,
      location,
      status: 'active',
      lastVerified: mockBlockHeight,
      verifiedBy: mockTxSender,
      metadata
    });
    mockContractState.nextAssetId++;
    return { ok: assetId };
  },
  
  verifyAsset: (assetId) => {
    const asset = mockContractState.assets.get(assetId);
    if (!asset) return { err: 101 };
    
    asset.lastVerified = mockBlockHeight;
    asset.verifiedBy = mockTxSender;
    asset.status = 'verified';
    return { ok: true };
  },
  
  getAsset: (assetId) => {
    return mockContractState.assets.get(assetId) || null;
  },
  
  updateAssetStatus: (assetId, newStatus) => {
    const asset = mockContractState.assets.get(assetId);
    if (!asset) return { err: 101 };
    
    asset.status = newStatus;
    return { ok: true };
  }
};

describe('Asset Verification Contract', () => {
  beforeEach(() => {
    mockContractState.assets.clear();
    mockContractState.nextAssetId = 1;
  });
  
  it('should register a new asset', () => {
    const result = assetVerificationContract.registerAsset(
        'traffic-light',
        'Main St & 1st Ave',
        'LED traffic light with smart sensors'
    );
    
    expect(result.ok).toBe(1);
    
    const asset = assetVerificationContract.getAsset(1);
    expect(asset).toBeDefined();
    expect(asset.assetType).toBe('traffic-light');
    expect(asset.location).toBe('Main St & 1st Ave');
    expect(asset.status).toBe('active');
  });
  
  it('should verify an existing asset', () => {
    // First register an asset
    assetVerificationContract.registerAsset(
        'street-lamp',
        'Park Ave & 2nd St',
        'Smart LED street lamp'
    );
    
    // Then verify it
    const result = assetVerificationContract.verifyAsset(1);
    expect(result.ok).toBe(true);
    
    const asset = assetVerificationContract.getAsset(1);
    expect(asset.status).toBe('verified');
  });
  
  it('should update asset status', () => {
    // Register an asset
    assetVerificationContract.registerAsset(
        'sensor',
        'City Hall',
        'Air quality sensor'
    );
    
    // Update status
    const result = assetVerificationContract.updateAssetStatus(1, 'maintenance');
    expect(result.ok).toBe(true);
    
    const asset = assetVerificationContract.getAsset(1);
    expect(asset.status).toBe('maintenance');
  });
  
  it('should return error for non-existent asset', () => {
    const result = assetVerificationContract.verifyAsset(999);
    expect(result.err).toBe(101);
  });
  
  it('should handle multiple assets', () => {
    // Register multiple assets
    assetVerificationContract.registerAsset('camera', 'Location 1', 'Security camera');
    assetVerificationContract.registerAsset('sensor', 'Location 2', 'Temperature sensor');
    assetVerificationContract.registerAsset('light', 'Location 3', 'Street light');
    
    expect(mockContractState.assets.size).toBe(3);
    expect(assetVerificationContract.getAsset(1).assetType).toBe('camera');
    expect(assetVerificationContract.getAsset(2).assetType).toBe('sensor');
    expect(assetVerificationContract.getAsset(3).assetType).toBe('light');
  });
});
