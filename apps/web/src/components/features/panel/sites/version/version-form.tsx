import { MediaUpload } from "@/components/shared/media-upload";
import { Field, FieldLabel } from "@/components/ui/field";

interface VersionFormData {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
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
      {/* OG Image */}
      <Field>
        <FieldLabel>OG Image</FieldLabel>
        <MediaUpload
          aspectRatio="og"
          className="max-w-xs"
          disabled={disabled}
          label="1200x630 recommended"
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
              label="Web Cover (required)"
              mediaType="image"
              onChange={(url) => onChange({ webCover: url ?? "" })}
              value={value.webCover}
            />
          </Field>
          <Field>
            <MediaUpload
              aspectRatio="cover"
              disabled={disabled}
              label="Web Recording"
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
              label="Mobile Cover"
              mediaType="image"
              onChange={(url) => onChange({ mobileCover: url })}
              value={value.mobileCover}
            />
          </Field>
          <Field>
            <MediaUpload
              aspectRatio="mobile"
              disabled={disabled}
              label="Mobile Recording"
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
