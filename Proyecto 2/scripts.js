// scripts.js
// Modulo compartido para las interacciones activas del sitio.

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-toggle-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.toggleTarget;
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const labelShow = button.dataset.labelShow || 'Mostrar';
      const labelHide = button.dataset.labelHide || 'Ocultar';

      target.classList.toggle('hidden');
      button.setAttribute('aria-expanded', String(!isExpanded));
      button.textContent = isExpanded ? labelShow : labelHide;
    });
  });

  const downloadChecks = Array.from(document.querySelectorAll('.download-check'));
  const downloadButton = document.querySelector('[data-download-selected]');
  const selectAllButton = document.querySelector('[data-select-all]');
  const clearSelectionButton = document.querySelector('[data-clear-selection]');
  const feedback = document.querySelector('[data-download-feedback]');

  if (downloadChecks.length && downloadButton && feedback) {
    const setFeedback = (message) => {
      feedback.textContent = message;
    };

    const getSelectedDownloads = () => downloadChecks.filter((check) => check.checked);

    const triggerDownload = (checkbox, index) => {
      const link = document.createElement('a');
      link.href = checkbox.dataset.downloadHref || '';
      link.download = '';
      link.style.display = 'none';
      document.body.appendChild(link);

      window.setTimeout(() => {
        link.click();
        link.remove();
      }, index * 250);
    };

    downloadButton.addEventListener('click', () => {
      const selected = getSelectedDownloads();

      if (!selected.length) {
        setFeedback('Selecciona al menos una opcion para descargar.');
        return;
      }

      selected.forEach((checkbox, index) => triggerDownload(checkbox, index));
      setFeedback(`Se iniciara la descarga de ${selected.length} archivo(s).`);
    });

    if (selectAllButton) {
      selectAllButton.addEventListener('click', () => {
        downloadChecks.forEach((check) => {
          check.checked = true;
        });
        setFeedback('Se marcaron todas las opciones.');
      });
    }

    if (clearSelectionButton) {
      clearSelectionButton.addEventListener('click', () => {
        downloadChecks.forEach((check) => {
          check.checked = false;
        });
        setFeedback('La seleccion fue limpiada.');
      });
    }

    downloadChecks.forEach((check) => {
      check.addEventListener('change', () => {
        const total = getSelectedDownloads().length;
        setFeedback(
          total ? `${total} archivo(s) seleccionado(s).` : 'No hay archivos seleccionados.'
        );
      });
    });
  }

  const notesTitle = document.getElementById('titulo');
  const notesContent = document.getElementById('contenido');
  const notesContainer = document.getElementById('posts');
  const noteSaveButton = document.querySelector('[data-note-save]');
  const noteClearFormButton = document.querySelector('[data-note-clear-form]');
  const noteDeleteAllButton = document.querySelector('[data-note-delete-all]');
  const noteFeedback = document.querySelector('[data-note-feedback]');
  const noteCount = document.querySelector('[data-note-count]');
  const notesStorageKey = 'posts';
  let editingIndex = null;

  if (notesTitle && notesContent && notesContainer && noteSaveButton && noteFeedback) {
    const getNotes = () => {
      try {
        return JSON.parse(localStorage.getItem(notesStorageKey)) || [];
      } catch (error) {
        console.error('Error leyendo las notas guardadas:', error);
        return [];
      }
    };

    const saveNotes = (notes) => {
      localStorage.setItem(notesStorageKey, JSON.stringify(notes));
    };

    const setNoteFeedback = (message) => {
      noteFeedback.textContent = message;
    };

    const resetForm = () => {
      notesTitle.value = '';
      notesContent.value = '';
      editingIndex = null;
    };

    const downloadNote = (note) => {
      const fileContent = `${note.titulo}\n\n${note.contenido}`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = note.titulo.replace(/[\\/:*?"<>|]/g, '-').trim() || 'nota';

      link.href = url;
      link.download = `${safeName}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };

    const renderNotes = () => {
      const notes = getNotes();

      notesContainer.innerHTML = '';

      if (noteCount) {
        noteCount.textContent = `${notes.length} nota${notes.length === 1 ? '' : 's'}`;
      }

      if (!notes.length) {
        notesContainer.innerHTML =
          '<div class="empty-notes">Todavia no hay notas guardadas. Escribe una y guardala aqui.</div>';
        return;
      }

      notes.forEach((note, index) => {
        const card = document.createElement('article');
        card.className = 'post note-card';
        card.innerHTML = `
          <h3>${note.titulo}</h3>
          <p>${note.contenido.replace(/\n/g, '<br>')}</p>
          <div class="note-card__actions">
            <button type="button" class="boton" data-note-edit="${index}">Editar</button>
            <button type="button" class="boton" data-note-download="${index}">Descargar</button>
            <button type="button" class="boton" data-note-delete="${index}">Borrar</button>
          </div>
        `;
        notesContainer.appendChild(card);
      });
    };

    noteSaveButton.addEventListener('click', () => {
      const titulo = notesTitle.value.trim();
      const contenido = notesContent.value.trim();

      if (!titulo || !contenido) {
        setNoteFeedback('Escribe un titulo y contenido antes de guardar.');
        return;
      }

      const notes = getNotes();
      const note = { titulo, contenido };

      if (editingIndex !== null) {
        notes[editingIndex] = note;
        setNoteFeedback('La nota fue actualizada.');
      } else {
        notes.push(note);
        setNoteFeedback('La nota fue guardada.');
      }

      saveNotes(notes);
      resetForm();
      renderNotes();
    });

    if (noteClearFormButton) {
      noteClearFormButton.addEventListener('click', () => {
        resetForm();
        setNoteFeedback('El formulario quedo limpio.');
      });
    }

    if (noteDeleteAllButton) {
      noteDeleteAllButton.addEventListener('click', () => {
        localStorage.removeItem(notesStorageKey);
        resetForm();
        renderNotes();
        setNoteFeedback('Se borraron todas las notas guardadas.');
      });
    }

    notesContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const editIndex = target.dataset.noteEdit;
      const deleteIndex = target.dataset.noteDelete;
      const downloadIndex = target.dataset.noteDownload;
      const notes = getNotes();

      if (editIndex !== undefined) {
        const note = notes[Number(editIndex)];
        if (!note) return;

        notesTitle.value = note.titulo;
        notesContent.value = note.contenido;
        editingIndex = Number(editIndex);
        setNoteFeedback('Editando nota guardada.');
        return;
      }

      if (deleteIndex !== undefined) {
        notes.splice(Number(deleteIndex), 1);
        saveNotes(notes);
        if (editingIndex === Number(deleteIndex)) {
          resetForm();
        }
        renderNotes();
        setNoteFeedback('La nota fue borrada.');
        return;
      }

      if (downloadIndex !== undefined) {
        const note = notes[Number(downloadIndex)];
        if (!note) return;

        downloadNote(note);
        setNoteFeedback(`Se descargo "${note.titulo}".`);
      }
    });

    renderNotes();
  }

  const binaryCanvas = document.querySelector('.binary-canvas');

  if (binaryCanvas) {
    const ctx = binaryCanvas.getContext('2d');

    if (ctx) {
      let width = 0;
      let height = 0;
      const columns = [];
      const settings = {
        spacing: 48,
        minSpeed: 0.8,
        maxSpeed: 1.8,
        maxLength: 20,
        alpha: 0.78,
        fontFamily: 'Orbitron, monospace'
      };

      const resizeCanvas = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        binaryCanvas.width = Math.floor(width * pixelRatio);
        binaryCanvas.height = Math.floor(height * pixelRatio);
        binaryCanvas.style.width = `${width}px`;
        binaryCanvas.style.height = `${height}px`;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        initializeColumns();
      };

      const initializeColumns = () => {
        columns.length = 0;
        const count = Math.max(13, Math.floor(width / settings.spacing));
        const spacing = width / count;

        for (let index = 0; index < count; index += 1) {
          const length = 10 + Math.floor(Math.random() * settings.maxLength);
          columns.push({
            x: spacing * index + spacing * 0.5,
            y: Math.random() * -height,
            speed: settings.minSpeed + Math.random() * (settings.maxSpeed - settings.minSpeed),
            fontSize: 14 + Math.random() * 8,
            length,
            digits: Array.from({ length }, () => (Math.random() > 0.44 ? '1' : '0')),
            changeInterval: 20 + Math.floor(Math.random() * 26),
            changeTimer: 0
          });
        }
      };

      const drawBinaryRain = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        columns.forEach((column) => {
          column.y += column.speed;
          column.changeTimer += 1;

          if (column.changeTimer >= column.changeInterval) {
            column.changeTimer = 0;
            const changeIndex = Math.floor(Math.random() * column.digits.length);
            column.digits[changeIndex] = column.digits[changeIndex] === '1' ? '0' : '1';
          }

          const rowHeight = column.fontSize * 1.14;
          ctx.font = `${column.fontSize}px ${settings.fontFamily}`;

          for (let step = 0; step < column.length; step += 1) {
            const yPos = column.y - step * rowHeight;
            if (yPos < -rowHeight || yPos > height + rowHeight) {
              continue;
            }

            const digit = column.digits[step % column.digits.length];
            const fade = Math.max(0, 1 - step / column.length);
            ctx.fillStyle = `rgba(126, 255, 212, ${settings.alpha * fade})`;
            ctx.fillText(digit, column.x, yPos);
          }

          if (column.y > height + column.length * rowHeight) {
            column.y = Math.random() * -height * 0.4;
            column.speed = settings.minSpeed + Math.random() * (settings.maxSpeed - settings.minSpeed);
            column.length = 10 + Math.floor(Math.random() * settings.maxLength);
            column.fontSize = 14 + Math.random() * 8;
            column.digits = Array.from({ length: column.length }, () => (Math.random() > 0.44 ? '1' : '0'));
            column.changeInterval = 20 + Math.floor(Math.random() * 26);
            column.changeTimer = 0;
          }
        });
      };

      const animate = () => {
        drawBinaryRain();
        requestAnimationFrame(animate);
      };

      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      requestAnimationFrame(animate);
    }
  }
});
