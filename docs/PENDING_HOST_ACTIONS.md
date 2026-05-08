# Pending Host Actions: S0-BEACON Infrastructure

## Tailscale Integration: Primed but Paused

The integration of Tailscale on the S0-BEACON node is currently blocked at the host level. The `tailscaled` daemon is installed and active, but cannot initialize the `tailscale0` interface due to the lack of a TUN device within the LXC container.

### Unblocking Requirements

To unblock Tailscale, the following actions must be performed on the **Proxmox Host** by a user with root privileges:

1. **Enable TUN Device Passthrough:**
   ```bash
   # Replace <VMID> with the ID of the S0-BEACON container (e.g., 100)
   pct set <VMID> --device-passthrough /dev/net/tun
   ```

2. **Reboot the Container:**
   ```bash
   pct reboot <VMID>
   ```

### Post-Action Verification

Once the host actions are completed, verify the TUN device within S0-BEACON:
```bash
ls -l /dev/net/tun
# Expected: crw-rw-rw- 1 root root 10, 200 ... /dev/net/tun
```

Then, initialize Tailscale:
```bash
tailscale up
```

---
*Documented by SentinelTrade Infrastructure Provisioning Agent - 2026-05-08*
