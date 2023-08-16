import React, { useState, useRef, useEffect } from 'react';

const CameraButton: React.FC = () => {
  const onStreamVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flipBtnRef = useRef<HTMLButtonElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [shouldFaceUser, setShouldFaceUser] = useState<boolean>(true);
  const widthScreen = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  const heightScreen = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  const [isImageAvailable, setImageAvailable] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const constraints: MediaStreamConstraints = { audio: false, video: true };
    const supports = navigator.mediaDevices.getSupportedConstraints();

    if (supports['facingMode'] === true) {
      if (flipBtnRef.current) {
        flipBtnRef.current.disabled = false;
      }
    }

    const openCamera = () => {
      constraints.video = {
        width: heightScreen,
        height: widthScreen,
        facingMode: shouldFaceUser ? 'user' : 'environment',
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(mediaStream => {
          setStream(mediaStream);
          if (onStreamVideoRef.current) {
            onStreamVideoRef.current.srcObject = mediaStream;
            onStreamVideoRef.current.play();
          }
        })
        .catch(err => {
          console.log(err);
        });
    };

    if (!isImageAvailable) {
      openCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => {
          t.stop();
        });
      }
    };
  }, [shouldFaceUser, isImageAvailable]);

  const handleFlipClick = () => {
    if (stream) {
      stream.getTracks().forEach(t => {
        t.stop();
      });
    }
    setShouldFaceUser(!shouldFaceUser);
  };

  const handleCaptureClick = () => {
    const video = onStreamVideoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = widthScreen;
      canvas.height = heightScreen;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        handleConvertCanvasToBlob()
        setImageAvailable(true);
      }
    }
  };

  const handleConvertCanvasToBlob = () => {
    const photo = canvasRef.current;
    console.warn('data photo', photo);
    if (photo) {
      const data = photo.toDataURL("image/jpeg");
      console.warn('data', data);
      convertToFile(data);
      handleMakeTagImg(data)
    }
  }

  const handleMakeTagImg = (blob: any) => {
    const strip = stripRef.current;
    if (strip) {
      const link = document.createElement("a");
      link.setAttribute("download", "mypotho");
      link.innerHTML = `<img src='${blob}' alt='thumbnail'/>`;
      strip.insertBefore(link, strip.firstChild);
    }

  }

  const convertToFile = async (dataUrl: any) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const imageFile = new File([blob], "image.jpg", { type: "image/jpeg" });
    console.log(imageFile)
  }
  const backToCamera = () => {
    const strip = stripRef.current;
    if (strip) {
      strip.innerHTML = '';
      setImageAvailable(false);
    }
    console.log(strip);
  }

  useEffect(() => {
    console.log('yuhu image available', isImageAvailable)
  }, [isImageAvailable])
  return (
    <div className="bg-gray-100 w-screen flex-col flex items-center">
      {
        !isImageAvailable ?
          <video ref={onStreamVideoRef} className="border border-5 border-danger" />
          : ''
      }

      <div>
        <canvas ref={canvasRef} hidden></canvas>
        <div ref={stripRef} />
      </div>
      <div>
        {
          !isImageAvailable ?
            <button disabled={!stream} ref={flipBtnRef} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full w-max fixed bottom-20" onClick={handleFlipClick}>
              Flip Camera
            </button>
            : <></>
        }

        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full w-max fixed bottom-5" onClick={!isImageAvailable ? handleCaptureClick : backToCamera}>
          {
            !isImageAvailable ? 'Take Photo' : 'Back to Camera'
          }
        </button>
      </div>
    </div>
  );
};

export default CameraButton;
