import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sucesso from './Sucesso';

describe('Página de obrigado', () => {
  it('exibe mensagem de confirmação e botão para voltar ao início', () => {
    render(
      <MemoryRouter>
        <Sucesso />
      </MemoryRouter>
    );

    expect(screen.getByText(/sua reserva foi enviada com sucesso/i)).toBeTruthy();
    expect(screen.getByText(/seguir nas redes sociais/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /voltar ao início/i })).toBeTruthy();
  });
});
