# [S-1] CEREBRO: AI Inference Brain

## Technical Specifications
| Specification | Value |
| :--- | :--- |
| **Type** | Virtual Machine |
| **OS** | Ubuntu 24.04 LTS Server |
| **Machine Type** | Q35 |
| **BIOS** | OVMF (UEFI) |
| **CPU** | 6 Cores (Type: Host) |
| **RAM** | 24GB (Static / No Ballooning) |
| **Storage** | 64GB (local-lvm) |
| **Accelerator** | NVIDIA Tesla P100 16GB (PCI Passthrough) |

## Networking Logic
CEREBRO is isolated from the external internet to ensure security and low-latency communication with the execution node.

- **Bridge:** `vmbr4` (Isolated Private Fabric)
- **Static IP:** `10.0.0.2`

## Hardware Dependencies (Dell R540)
The Tesla P100 is a high-performance, passively cooled accelerator requiring specific Dell R540 thermal configurations.
- **Cooling:** The **blue plastic air shroud** MUST be installed to direct high-velocity airflow from the chassis fans through the P100 fins.
- **Power:** Requires the proprietary Dell R540 GPU power cable (connected to the riser board).
- **BIOS Settings:** 
    - Enable **IOMMU**.
    - Enable **Above 4GB Decoding**.

## Living TODO List
- [ ] Enable IOMMU and Above 4GB Decoding in R540 BIOS.
- [ ] Install NVIDIA Data Center Drivers (535+):
    ```bash
    sudo apt update && sudo apt install -y nvidia-driver-535-server
    ```
- [ ] Install AI Inference Engine (Ollama / vLLM).
- [ ] Verify GPU visibility:
    ```bash
    nvidia-smi
    ```
- [ ] Assign Static IP `10.0.0.2` on `vmbr4`.

## Audit Trail
- **2024-05-05:** Document initialized by Systems Architect.
- **2024-05-05:** Hardware compatibility check for Tesla P100 completed.
