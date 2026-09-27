import { createRoot } from 'react-dom/client';

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn()
}));

jest.mock('@wf/react-library', () => ({
  ConfigContextProvider: jest.fn()
}));

jest.mock('./App', () => {
  return function MockApp() {
    return <div>MockApp</div>;
  };
});

describe('bootstrap', () => {
  it('renders App within ConfigContextProvider and React.StrictMode', () => {
    const mockRender = jest.fn();
    document.body.innerHTML = '<div id="root"></div>';
    jest.mocked(createRoot).mockReturnValue({ render: mockRender, unmount: jest.fn() });

    jest.isolateModules(() => {
      jest.requireActual('./main');
    });

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
