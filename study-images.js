for (const image of document.querySelectorAll('.preview-art img, .collected-art img')) {
  const showFailure = () => {
    image.hidden = true;
    const message = image.closest('figure').querySelector('.preview-error');
    if (message) message.hidden = false;
  };
  image.addEventListener('error', showFailure);
  if (image.complete && image.naturalWidth === 0) showFailure();
}
