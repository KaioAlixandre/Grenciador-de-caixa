const { UsuarioService, SaldoService } = require('../models');
const { sendTokenResponse } = require('../utils/auth');
const { logAuth, logError } = require('../utils/logger');
const validator = require('validator');

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e senha são obrigatórios'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Verificar se o usuário já existe
    const usuarioExistente = await UsuarioService.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        error: 'Email já está em uso'
      });
    }

    // Criar usuário
    const usuario = await UsuarioService.criarUsuario({
      nome,
      email,
      senha
    });

    // Criar saldo inicial para o usuário
    await SaldoService.buscarOuCriar(usuario.id);

    sendTokenResponse(usuario, 201, res);
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Login do usuário
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Validar email e senha
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário por email (incluindo senha)
    const usuario = await UsuarioService.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    // Verificar senha
    const senhaCorreta = await UsuarioService.compararSenha(senha, usuario.senha);

    if (!senhaCorreta) {
      logAuth('failed', email, req.ip);
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    await UsuarioService.atualizarUltimoLogin(usuario.id);

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    // Log do login bem-sucedido
    logAuth('login', usuario.nome, req.ip);

    sendTokenResponse(usuarioSemSenha, 200, res);
  } catch (error) {
    logError('❌', 'Erro no login', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const usuario = await UsuarioService.buscarPorId(req.user.id);

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};