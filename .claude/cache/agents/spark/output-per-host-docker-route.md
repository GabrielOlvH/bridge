# Quick Analysis: Per-Host Docker Route Status
Generated: 2026-01-17T15:30:00

## Summary

**RECOMMENDATION: REMOVE OR UPDATE**

The per-host Docker route (`app/hosts/[id]/docker.tsx`) is currently **still linked** from the Hosts tab, but it appears **redundant** with the new unified Docker tab. The unified tab already supports host filtering via URL params (`?hostId=...`).

## Current State

### Per-Host Docker Route (`app/hosts/[id]/docker.tsx`)
- **Purpose**: Shows Docker containers/images/volumes/networks for a single host
- **UI Style**: Old style (basic cards, no glass effects, no animations)
- **Features**: Read-only view, no container actions (start/stop)
- **Navigation**: Simple back button, refresh button

### Unified Docker Tab (`app/(tabs)/docker.tsx`)
- **Purpose**: Shows all containers across all hosts with filtering
- **UI Style**: New liquid glass design with GlassCard, FadeIn animations, PulsingDot
- **Features**: Container actions (start/stop), terminal access, host filtering
- **Navigation**: Tab-based with host filter chips

## Links Found

### Active Links (1)
1. **Hosts Tab** (`app/(tabs)/hosts.tsx:76`)
   ```typescript
   const handleDocker = useCallback(
     (hostId: string) => {
       router.push(`/hosts/${hostId}/docker`);
     },
     [router]
   );
   ```
   - Called from HostCard's `onDocker` prop at line 140

### Passive References
- Registered in `app/_layout.tsx:66` as a screen route
- Container detail route still links back to it for container navigation
- Referenced in documentation/handoff files

## Functional Differences

| Feature | Per-Host Route | Unified Tab |
|---------|---------------|-------------|
| Host filtering | Single host only | All hosts + filter chips |
| Container actions | None | Start/Stop buttons |
| Terminal access | Via sub-route | Direct button |
| UI Design | Basic cards | Liquid glass |
| Animations | None | FadeIn, PulsingDot |
| Live stats | Yes | Yes |
| Images/Volumes/Networks | Yes | No (containers only) |

## Decision Points

### Option 1: Remove Per-Host Route (RECOMMENDED)
**Rationale**: The unified tab already supports host-specific view via `?hostId` param

**Changes needed**:
1. Update `app/(tabs)/hosts.tsx:76` to:
   ```typescript
   router.push(`/(tabs)/docker?hostId=${hostId}`);
   ```
2. Update container detail navigation in `app/(tabs)/docker.tsx:113` to match
3. Remove `app/hosts/[id]/docker.tsx`
4. Remove screen registration in `app/_layout.tsx:66`

**Pros**:
- Eliminates code duplication
- Consistent UI across all Docker views
- Fewer routes to maintain

**Cons**:
- Loses images/volumes/networks view (unified tab only shows containers)
- Need to add those sections to unified tab if needed

### Option 2: Keep and Update Per-Host Route
**Rationale**: Provides detailed per-host Docker management with images/volumes/networks

**Changes needed**:
1. Update UI to use GlassCard, FadeIn, new theme
2. Add container actions (start/stop)
3. Add terminal button navigation
4. Match liquid glass design system

**Pros**:
- Preserves detailed Docker management per host
- Separation of concerns (per-host vs. all-hosts view)

**Cons**:
- More code to maintain
- Two different Docker UIs to keep in sync

### Option 3: Hybrid Approach
**Rationale**: Unified tab for quick container management, per-host route for detailed Docker resources

**Changes needed**:
1. Update per-host route UI to match new design
2. Make it the "detailed view" (images/volumes/networks focus)
3. Keep unified tab for container-centric workflow
4. Add navigation from unified tab to per-host route for "see all resources"

## Files Modified

None yet - awaiting decision

## Verification

- Syntax check: N/A (analysis only)
- Pattern followed: Liquid glass design analysis

## Notes

The key missing feature in the unified tab is **images/volumes/networks management**. If that's important, consider Option 3 (hybrid). If container management is the primary use case, Option 1 (remove) is cleaner.

**Next Step**: Decide which option aligns with product goals, then implement.
