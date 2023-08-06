import { FileUpload } from 'primereact/fileupload';
import { gql, useMutation } from '@apollo/client';
import { useRef, useState } from 'react';

export default function Index() {
  const [img, setImg] = useState('');

  const uploader = useRef<FileUpload>(null);
  const [uploadMutation, uploadMutationMetadata] = useMutation(gql`
    mutation updateImage($blob: String!) {
      insert_image_one(object: { blob: $blob }) {
        blob
      }
    }
  `);

  const customUploader = async (event) => {
    const file = event.files[0];
    try {
      const reader = new FileReader();

      reader.addEventListener(
        'load',
        () => {
          console.log(reader.result);
          setImg(reader.result as string);
          uploadMutation({ variables: { blob: reader.result as string } });

          uploader?.current?.clear();
        },
        false
      );

      if (file) {
        reader.readAsDataURL(file);
      }
    } catch (e) {
      console.error('Error during file read!', e);
    }
  };
  return (
    <>
      <h1>Upload</h1>
      <FileUpload
        accept="file/image"
        mode="basic"
        ref={uploader}
        customUpload
        uploadHandler={customUploader}
        onSelect={customUploader}
        emptyTemplate={<p className="m-0">Drop file here to upload.</p>}
      />
      <img src={img} />
    </>
  );
}
