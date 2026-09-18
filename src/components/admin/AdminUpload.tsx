import React, { useState, useRef } from 'react';
import { Upload, Key, Save, AlertCircle, CheckCircle, Github } from 'lucide-react';

export const AdminUpload: React.FC = () => {
  const [token, setToken] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // You can customize the repo details here or even make them configurable
  const repoOwner = 'rafaelst97';
  const repoName = 'painel-ucs-sc';
  const filePath = 'data_raw/UCs de SC-completo.xlsx';
  const branchName = 'main';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus({ type: null, message: '' });
    }
  };

  const getFileBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:*/*;base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!token) {
      setStatus({ type: 'error', message: 'Por favor, insira o Token do GitHub.' });
      return;
    }
    if (!file) {
      setStatus({ type: 'error', message: 'Por favor, selecione um arquivo .xlsx para enviar.' });
      return;
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setStatus({ type: 'error', message: 'O arquivo precisa ter a extensão .xlsx' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    try {
      // 1. Convert file to Base64
      const base64Content = await getFileBase64(file);

      // 2. Get current file SHA to update it (if it exists)
      let sha = '';
      const getFileResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${encodeURIComponent(filePath)}?ref=${branchName}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (getFileResponse.status === 404) {
        sha = '';
      } else if (!getFileResponse.ok) {
        const errorData = await getFileResponse.json();
        throw new Error(errorData.message || 'Falha ao verificar arquivo existente.');
      } else {
        const fileData = await getFileResponse.json();
        sha = fileData.sha;
      }

      // 3. Upload/Update file via GitHub API
      const uploadResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${encodeURIComponent(filePath)}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `update: atualizacao da base de dados via admin panel - ${new Date().toISOString()}`,
            content: base64Content,
            branch: branchName,
            ...(sha ? { sha } : {}), // only include sha if updating
          }),
        }
      );

      if (uploadResponse.ok) {
        setStatus({
          type: 'success',
          message: 'Planilha atualizada com sucesso no GitHub! As alterações aparecerão no painel em alguns minutos (após a conclusão do GitHub Actions).',
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Erro ao fazer upload no GitHub');
      }
    } catch (error: unknown) {
      console.error(error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mx-auto mb-4">
            <Save className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Atualização da Base de Dados
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Faça o upload de uma nova planilha (.xlsx) para substituir os dados no repositório. O site será atualizado automaticamente em seguida.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Selecione a Planilha (.xlsx)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Clique para selecionar</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">APENAS .XLSX</p>
                </div>
                <input
                  type="file"
                  className="sr-only"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </label>
            </div>
            {file && (
              <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>

          {/* GitHub Token */}
          <div>
            <label htmlFor="github-token" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              Token de Acesso do GitHub (PAT)
            </label>
            <input
              id="github-token"
              type="password"
              aria-label="Token de Acesso do GitHub (PAT)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition font-mono"
              disabled={isUploading}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Use um token fine-grained restrito a este repositório, com permissão de <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Contents: Read and write</code>. Esse token não é salvo em nenhum lugar.
            </p>
          </div>

          {/* Status Message */}
          {status.type && (
            <div
              role="alert"
              className={`p-4 rounded-xl flex items-start gap-3 border ${
                status.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'
              }`}
            >
              {status.type === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-sm font-medium leading-relaxed">{status.message}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !token || !file}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enviando para o GitHub...</span>
              </>
            ) : (
              <>
                <Github className="w-5 h-5" />
                <span>Atualizar Planilha Oficial</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
