/**
 * Re-export the canonical artifact picker from a general-purpose
 * location so non-curriculum surfaces (story creator, scenario seeder,
 * any future "attach an entity to this thing" surface) can pull it
 * without reaching into curriculum/. The implementation stays in
 * src/components/curriculum/artifact-picker.tsx to avoid breaking the
 * existing import paths.
 *
 * Future home: when more than one non-curriculum caller adopts this,
 * promote the implementation up to this directory and have curriculum
 * re-export downward instead.
 */

export {
  ArtifactPicker,
  artifactTypeIcon,
  type PickedArtifact,
} from '@/components/curriculum/artifact-picker';
