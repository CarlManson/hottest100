-- One-off cleanup after the 2025 season was archived.
-- Archive & Reset used to delete members but leave their groups behind, empty.
-- This removes only groups that have no members left. Groups now reset with each
-- season (Archive & Reset saves them into the archive, then clears them).

-- Check first: lists the groups this would remove
SELECT g.name, g.emoji
FROM groups g
WHERE NOT EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = g.id);

-- Then remove them
DELETE FROM groups g
WHERE NOT EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = g.id);
