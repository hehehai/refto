import { MediaUpload } from "@/components/shared/media-upload";
import { TagSelect } from "@/components/shared/tag-select";
import { Field, FieldLabel } from "@/components/ui/field";

interface VersionFormData {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
  tagIds: string[];
}

interface VersionFormProps {
  value: VersionFormData;
  onChange: (data: Partial<VersionFormData>) => void;
  disabled?: boolean;
}

export function VersionForm({
  value,
  onChange,
  disabled = false,
}: VersionFormProps) {
  return (
    <div className="space-y-6">
      {/* Tags */}
      <Field>
        <FieldLabel>Tags</FieldLabel>
        <TagSelect
          disabled={disabled}
          matchBy="id"
          onChange={(tagIds) => onChange({ tagIds })}
          value={value.tagIds}
        />
      </Field>

      {/* OG Image */}
      <Field>
        <FieldLabel>
          OG Image <span>1200x630 recommended</span>
        </FieldLabel>
        <MediaUpload
          aspectRatio="og"
          className="max-w-xs"
          disabled={disabled}
          mediaType="image"
          onChange={(url) => onChange({ siteOG: url })}
          value={value.siteOG}
        />
      </Field>

      {/* Web Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Web Version</h4>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <MediaUpload
              aspectRatio="cover"
              disabled={disabled}
              mediaType="image"
              onChange={(url) => onChange({ webCover: url ?? "" })}
              value={value.webCover}
            />
          </Field>
          <Field>
            <MediaUpload
              aspectRatio="cover"
              disabled={disabled}
              mediaType="video"
              onChange={(url) => onChange({ webRecord: url })}
              value={value.webRecord}
            />
          </Field>
        </div>
      </div>

      {/* Mobile Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Mobile Version</h4>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <MediaUpload
              aspectRatio="mobile"
              disabled={disabled}
              mediaType="image"
              onChange={(url) => onChange({ mobileCover: url })}
              value={value.mobileCover}
            />
          </Field>
          <Field>
            <MediaUpload
              aspectRatio="mobile"
              disabled={disabled}
              mediaType="video"
              onChange={(url) => onChange({ mobileRecord: url })}
              value={value.mobileRecord}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
