export const grantsAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    inputs: [
      { internalType: 'address', name: 'grantee', type: 'address' },
      { internalType: 'string', name: 'dataId', type: 'string' },
      { internalType: 'uint256', name: 'lockedUntil', type: 'uint256' },
    ],
    name: 'deleteGrant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'grantee', type: 'address' },
      { internalType: 'string', name: 'dataId', type: 'string' },
    ],
    name: 'findGrants',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'address', name: 'grantee', type: 'address' },
          { internalType: 'string', name: 'dataId', type: 'string' },
          { internalType: 'uint256', name: 'lockedUntil', type: 'uint256' },
        ],
        internalType: 'struct AccessGrants.Grant[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'grantee', type: 'address' },
      { internalType: 'string', name: 'dataId', type: 'string' },
    ],
    name: 'grantsFor',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'address', name: 'grantee', type: 'address' },
          { internalType: 'string', name: 'dataId', type: 'string' },
          { internalType: 'uint256', name: 'lockedUntil', type: 'uint256' },
        ],
        internalType: 'struct AccessGrants.Grant[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'grantee', type: 'address' },
      { internalType: 'string', name: 'dataId', type: 'string' },
      { internalType: 'uint256', name: 'lockedUntil', type: 'uint256' },
    ],
    name: 'insertGrant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
