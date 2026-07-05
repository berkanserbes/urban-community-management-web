import { useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toAbsoluteUrl } from '@/lib/utils'

type ProfileImageCardProps = {
  firstName: string
  lastName: string
  profileImageUrl?: string | null
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
}

export function ProfileImageCard({
  firstName,
  lastName,
  profileImageUrl,
  onUpload,
  onDelete,
}: ProfileImageCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  const profileImageSrc = toAbsoluteUrl(profileImageUrl)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      setIsUploading(true)
      await onUpload(file)
      toast.success('Profil fotoğrafı güncellendi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fotoğraf yüklenemedi')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete()
      toast.success('Profil fotoğrafı silindi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fotoğraf silinemedi')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Fotoğrafı</CardTitle>
        <CardDescription>Hesap fotoğrafınızı yükleyin veya kaldırın.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="transition-all duration-500 ease-in-out">
          <Avatar className="size-24">
            {profileImageSrc ? (
              <AvatarImage
                key={profileImageSrc}
                src={profileImageSrc}
                alt={`${firstName} ${lastName}`}
                className="transition-opacity duration-500"
              />
            ) : null}
            <AvatarFallback className="text-xl font-semibold">{initials || 'UC'}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="size-4" />
            {isUploading ? 'Yükleniyor' : 'Fotoğraf Yükle'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !profileImageUrl}
          >
            <Trash2 className="size-4" />
            {isDeleting ? 'Siliniyor' : 'Kaldır'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-xs text-muted-foreground">
          JPG, PNG veya WebP formatları desteklenir.
        </p>
      </CardContent>
    </Card>
  )
}
