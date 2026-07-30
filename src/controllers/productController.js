const { validationResult } = require('express-validator');

const Product = require('../models/Product');

//==================================================//
//                Criando Produto                  //
//==================================================//

const createProduct = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      name,
      description,
      brand,
      category,
      stockQuantity,
      minimumStock,
      unitPrice,
      status,
    } = req.body;

    const product = await Product.create({
      name,
      description,
      brand,
      category,
      stockQuantity: stockQuantity || 0,
      minimumStock: minimumStock || 0,
      unitPrice: unitPrice || 0,
      status: status || 'ATIVO',
    });

    return res.status(201).json({
      message: 'Produto cadastrado com sucesso.',
      product,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//           Listando todos os Produtos            //
//==================================================//

const getProducts = async (req, res) => {
  try {

    const products = await Product.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json(products);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//              Buscando Produto por ID            //
//==================================================//

const getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado.',
      });
    }

    return res.status(200).json(product);

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//             Atualizando Produto                 //
//==================================================//

const updateProduct = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado.',
      });
    }

    const {
      name,
      description,
      brand,
      category,
      stockQuantity,
      minimumStock,
      unitPrice,
      status,
    } = req.body;

    await product.update({
      name: name ?? product.name,
      description: description ?? product.description,
      brand: brand ?? product.brand,
      category: category ?? product.category,
      stockQuantity: stockQuantity ?? product.stockQuantity,
      minimumStock: minimumStock ?? product.minimumStock,
      unitPrice: unitPrice ?? product.unitPrice,
      status: status ?? product.status,
    });

    return res.status(200).json({
      message: 'Produto atualizado com sucesso.',
      product,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

//==================================================//
//               Excluindo Produto                 //
//==================================================//

const deleteProduct = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado.',
      });
    }

    await product.destroy();

    return res.status(200).json({
      message: 'Produto excluído com sucesso.',
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });

  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
